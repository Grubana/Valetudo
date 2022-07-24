const AutoEmptyDockManualTriggerCapability = require("../../../core/capabilities/AutoEmptyDockManualTriggerCapability");
const Logger = require("../../../Logger");

/**
 * @extends AutoEmptyDockManualTriggerCapability<import("../RoborockValetudoRobot")>
 */
class RoborockAutoEmptyDockManualTriggerCapability extends AutoEmptyDockManualTriggerCapability {
    /**
     *
     * @param {object} options
     * @param {import("../RoborockValetudoRobot")} options.robot
     */
    constructor(options) {
        super(options);
        this.running = false;
    }

    /**
     * @returns {Promise<void>}
     */
    async triggerAutoEmpty() {
        if (this.running) {
            await this.robot.sendCommand("app_stop_collect_dust", [], {});
        } else{
            await this.robot.sendCommand("app_start_collect_dust", [], {});
        }
        this.status = !this.status;
    }
}

module.exports = RoborockAutoEmptyDockManualTriggerCapability;
