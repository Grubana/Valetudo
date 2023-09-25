const CapabilityRouter = require("./CapabilityRouter");
const ValetudoMapSegment = require("../../entities/core/ValetudoMapSegment");

class MapSegmentationCapabilityRouter extends CapabilityRouter {
    initRoutes() {
        this.router.get("/", async (req, res) => {
            try {
                res.json(await this.capability.getSegments());
            } catch (e) {
                this.sendErrorResponse(req, res, e);
            }
        });

        this.router.put("/", this.validator, async (req, res) => {
            switch (req.body.action) {
                case "start_segment_action":
                    if (!Array.isArray(req.body.segment_ids)) {
                        res.sendStatus(400);
                        return;
                    }
                    try {
                        const options = {};

                        if (typeof req.body.iterations === "number") {
                            options.iterations = req.body.iterations;
                        }

                        if (req.body.customOrder === true) {
                            options.customOrder = true;
                        }

                        await this.capability.executeSegmentAction(req.body.segment_ids.map(sid => {
                            return new ValetudoMapSegment({
                                id: sid
                            });
                        }), options);

                        res.sendStatus(200);
                    } catch (e) {
                        this.sendErrorResponse(req, res, e);
                    }
                    break;
                case "queue_segment_action":
                    if (!(typeof req.body.job_id === "string")) {
                        res.sendStatus(400);
                        return;
                    }
                    if (!Array.isArray(req.body.segment_ids)) {
                        res.sendStatus(400);
                        return;
                    }
                    try {
                        const options = {};

                        if (typeof req.body.iterations === "number") {
                            options.iterations = req.body.iterations;
                        }

                        if (req.body.customOrder === true) {
                            options.customOrder = true;
                        }

                        await this.capability.queueSegmentAction(req.body.job_id, req.body.segment_ids.map(sid => {
                            return new ValetudoMapSegment({
                                id: sid
                            });
                        }), options);

                        res.sendStatus(200);
                    } catch (e) {
                        this.sendErrorResponse(req, res, e);
                    }
                    break;
                case "dequeue_segment_action":
                    if (!(typeof req.body.job_id === "string")) {
                        res.sendStatus(400);
                        return;
                    }
                    try {
                        await this.capability.dequeueSegmentAction(req.body.job_id);
                        res.sendStatus(200);
                    } catch (e) {
                        this.sendErrorResponse(req, res, e);
                    }
                    break;
                case "check_queued_segment_action":
                    if (!(typeof req.body.job_id === "string")) {
                        res.sendStatus(400);
                        return;
                    }
                    try {
                        let status = this.capability.getJobStatus(req.body.job_id);
                        res.send(status);
                    } catch (e) {
                        this.sendErrorResponse(req, res, e);
                    }
                    break;
                case "get_queue":
                    try {
                        let queue = this.capability.getQueue();
                        res.send(JSON.stringify(queue));
                    } catch (e) {
                        this.sendErrorResponse(req, res, e);
                    }
                    break;
                default:
                    res.sendStatus(400);
                    break;
            }
        });
    }
}

module.exports = MapSegmentationCapabilityRouter;
