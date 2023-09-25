const Capability = require("./Capability");
const NotImplementedError = require("../NotImplementedError");
const MapSegmentationQueueFactory = require("./MapSegmentationQueueFactory");

/**
 * @template {import("../ValetudoRobot")} T
 * @extends Capability<T>
 */
class BasicControlCapability extends Capability {

    /**
     * The most basic functionalities
     *
     * @param {object} options
     * @param {T} options.robot
     */
    constructor(options) {
        super(options);
    }


    /**
     * Also resume if paused
     *
     * @abstract
     * @returns {Promise<void>}
     */
    async start() {
        throw new NotImplementedError();
    }

    /**
     * @abstract
     * @returns {Promise<void>}
     */
    async stop() {
        throw new NotImplementedError();
    }

    /**
     * @abstract
     * @returns {Promise<void>}
     */
    async pause() {
        throw new NotImplementedError();
    }

    /**
     * @returns {Promise<void>}
     */
    async home() {
        const mapSegmentationQueue = MapSegmentationQueueFactory.get();
        if(mapSegmentationQueue !== null){
            await mapSegmentationQueue.clear();
        }
        await this.execHome();
    }
    /**
     * @abstract
     * @returns {Promise<void>}
     */
    async execHome() {
        throw new NotImplementedError();
    }

    getType() {
        return BasicControlCapability.TYPE;
    }
}

BasicControlCapability.TYPE = "BasicControlCapability";

module.exports = BasicControlCapability;
