const entities = require("../../entities");
const Logger = require("../../Logger");
const Semaphore = require("semaphore");
const CallbackAttributeSubscriber = require("../../entities/CallbackAttributeSubscriber");
const {StatusStateAttribute, BatteryStateAttribute} = require("../../entities/state/attributes");


class MapSegmentationQueue {
    constructor(capability, robot) {
        this.mutex = Semaphore(1);
        this.queue = [];
        this.capability = capability;
        this.robot = robot;


        this.robot.state.subscribe(
            new CallbackAttributeSubscriber((eventType, status, prevStatus) => {
                this.runLocked();
            }),
            {attributeClass: StatusStateAttribute.name}
        );

        this.robot.state.subscribe(
            new CallbackAttributeSubscriber((eventType, status, prevStatus) => {
                this.runLocked();
            }),
            {attributeClass: BatteryStateAttribute.name}
        );
    }

    async add(jobId, segments, options) {
        if (this.queue.some((x) => x.jobId === jobId)) {
            return;
        }
        this.queue.push({
            jobId: jobId,
            segments: segments,
            options: options,
            state: "enqueued"
        });

        Logger.info("queue is", JSON.stringify(this.queue))

        await this.runLocked();
    }

    async remove(jobId) {
        this.queue = this.queue.filter((queued) => queued.jobId !== jobId);
        await this.runLocked();
    }

    async clear() {
        this.queue = [];
        await this.runLocked();
    }

    getStatus(jobId) {
        let job = this.queue.find((queued) => queued.jobId === jobId);
        if (job === undefined) {
            return "not_queued";
        }
        switch (job.state) {
            case "enqueued":
                return "queued";
            case "waiting_for_charge":
                return "queued";
            case "emitted":
                return "running";
            case "cleaning":
                return "running";
        }
        Logger.error("Invalid state", job.state);
        throw new Error("Invalid state");
    }

    getQueue() {
        return this.queue;
    }

    async runLocked() {
        return new Promise((resolve, reject) => {
            this.mutex.take(() =>
                this.run()
                    .then(() => {
                    this.mutex.leave();
                    resolve();
                }).catch((e) => {
                    this.mutex.leave();
                    reject();
                }));
        });
    }

    async run() {
        const StatusStateAttribute = this.robot.state.getFirstMatchingAttribute({
            attributeClass: entities.state.attributes.StatusStateAttribute.name,
        });

        if (StatusStateAttribute === null) {
            Logger.info("state updated", JSON.stringify(StatusStateAttribute));
            return;
        }

        const BatteryStateAttribute = this.robot.state.getFirstMatchingAttribute({
            attributeClass: entities.state.attributes.BatteryStateAttribute.name,
        });

        Logger.info("state updated", StatusStateAttribute.value, StatusStateAttribute.flag);

        if (this.queue.length === 0) {
            return;
        }

        const relevantStatesForEmitting = [
            entities.state.attributes.StatusStateAttribute.VALUE.DOCKED,
            entities.state.attributes.StatusStateAttribute.VALUE.RETURNING,
        ];

        switch (this.queue[0].state){
            case "enqueued":
                if(BatteryStateAttribute.level < 40) {
                    this.queue[0].state = "waiting_for_charge";
                    break;
                }

                await this.enqueueJob(this.queue[0]);
                break;
            case "waiting_for_charge":
                if(BatteryStateAttribute.level < 95) {
                    break;
                }
                await this.enqueueJob(this.queue[0]);
                break;
            case "emitted":
                if (!relevantStatesForEmitting.some(i => i === StatusStateAttribute.value)) {
                    this.queue[0].state = "cleaning";
                }
                break;
            case "cleaning":
                if (relevantStatesForEmitting.some(i => i === StatusStateAttribute.value)) {
                    this.queue = this.queue.slice(1);
                    await this.run();
                }
                break;
            default:
                Logger.error("Invalid state", this.queue[0].state);
                throw new Error("Invalid state");
        }
    }

    async enqueueJob(job){
        Logger.info("cleaning next segments", job.segments.map(i => i.id), job.options);
        try {
            await this.capability.executeSegmentAction(job.segments, job.options);
            job.state = "emitted";
        } catch (e) {
            Logger.info("error while starting segment cleaning", e);
        }
    }
}

module.exports = MapSegmentationQueue;
