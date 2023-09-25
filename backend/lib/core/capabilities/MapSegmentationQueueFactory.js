const MapSegmentationQueue = require("./MapSegmentationQueue");

class MapSegmentationQueueFactory {
    constructor() {
        /**
         * @type {MapSegmentationQueue}
         */
        this.instance = null;
    }


    get() {
        return this.instance;
    }

    /**
     * @param {import("./MapSegmentationCapability")} capability
     * @param {import("../ValetudoRobot")} robot
     * @returns {import("./MapSegmentationQueue")}
     */
    getOrInitInstance(capability, robot) {
        if (this.instance === null) {
            this.instance = new MapSegmentationQueue(capability, robot);
        }

        return this.instance;
    }

}

module.exports = new MapSegmentationQueueFactory();
