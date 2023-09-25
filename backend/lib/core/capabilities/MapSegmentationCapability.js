const Capability = require("./Capability");

const NotImplementedError = require("../NotImplementedError");
const MapSegmentationQueueFactory = require("./MapSegmentationQueueFactory");


/**
 * @template {import("../ValetudoRobot")} T
 * @extends Capability<T>
 */
class MapSegmentationCapability extends Capability {

    constructor(options) {
        super(options);
        this.queue = MapSegmentationQueueFactory.getOrInitInstance(this, options.robot);
    }

    /**
     * @returns {Promise<Array<import("../../entities/core/ValetudoMapSegment")>>}
     */
    async getSegments() {
        return this.robot.state.map.getSegments();
    }

    /**
     * Could be phrased as "cleanSegments" for vacuums or "mowSegments" for lawnmowers
     *
     *
     * @param {Array<import("../../entities/core/ValetudoMapSegment")>} segments
     * @param {object} [options]
     * @param {number} [options.iterations]
     * @param {boolean} [options.customOrder]
     * @returns {Promise<void>}
     */
    async executeSegmentAction(segments, options) {
        throw new NotImplementedError();
    }

    async queueSegmentAction(jobId, segments, options) {
        await this.queue.add(jobId, segments, options);
    }

    async dequeueSegmentAction(jobId) {
        await this.queue.remove(jobId);
    }

    getJobStatus(jobId) {
        return this.queue.getStatus(jobId);
    }

    getQueue() {
        return this.queue.getQueue();
    }

    /**
     * @returns {MapSegmentationCapabilityProperties}
     */
    getProperties() {
        return {
            iterationCount: {
                min: 1,
                max: 1
            },
            customOrderSupport: false
        };
    }

    getType() {
        return MapSegmentationCapability.TYPE;
    }
}

MapSegmentationCapability.TYPE = "MapSegmentationCapability";

module.exports = MapSegmentationCapability;

/**
 * @typedef {object} MapSegmentationCapabilityProperties
 *
 * @property {object} iterationCount
 * @property {number} iterationCount.min
 * @property {number} iterationCount.max
 *
 * @property {boolean} customOrderSupport
 */
