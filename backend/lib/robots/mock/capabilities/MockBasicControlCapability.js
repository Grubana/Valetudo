const BasicControlCapability = require("../../../core/capabilities/BasicControlCapability");
const entities = require("../../../entities");
const stateAttrs = entities.state.attributes;

/**
 * @extends BasicControlCapability<import("../MockRobot")>
 */
class MockBasicControlCapability extends BasicControlCapability {
    /**
     * @param {object} options
     * @param {import("../MockRobot")} options.robot
     */
    constructor(options) {
        super(options);

        this.robot.state.upsertFirstMatchingAttribute(new stateAttrs.StatusStateAttribute({
            value: stateAttrs.StatusStateAttribute.VALUE.DOCKED,
            flag: stateAttrs.StatusStateAttribute.FLAG.NONE
        }));

        this.robot.state.upsertFirstMatchingAttribute(new stateAttrs.BatteryStateAttribute({ level: 100 }));
        setInterval(() => {
            const state = this.robot.state.getFirstMatchingAttributeByConstructor(stateAttrs.StatusStateAttribute)
            const battery = this.robot.state.getFirstMatchingAttributeByConstructor(stateAttrs.BatteryStateAttribute)
            if (state.value === stateAttrs.StatusStateAttribute.VALUE.DOCKED && battery.level < 100) {
                this.robot.state.upsertFirstMatchingAttribute(new stateAttrs.BatteryStateAttribute({ level: battery.level + 1 }));
            } else if (state.value !== stateAttrs.StatusStateAttribute.VALUE.DOCKED && battery.level > 0) {
                this.robot.state.upsertFirstMatchingAttribute(new stateAttrs.BatteryStateAttribute({ level: battery.level - 1 }));
            }
        }, 1000);
    }

    async start() {
        this.robot.state.upsertFirstMatchingAttribute(new stateAttrs.StatusStateAttribute({
            value: stateAttrs.StatusStateAttribute.VALUE.CLEANING,
            flag: stateAttrs.StatusStateAttribute.FLAG.NONE
        }));
    }

    async stop() {
        this.robot.state.upsertFirstMatchingAttribute(new stateAttrs.StatusStateAttribute({
            value: stateAttrs.StatusStateAttribute.VALUE.IDLE,
            flag: stateAttrs.StatusStateAttribute.FLAG.NONE
        }));
    }

    async pause() {
        this.robot.state.upsertFirstMatchingAttribute(new stateAttrs.StatusStateAttribute({
            value: stateAttrs.StatusStateAttribute.VALUE.PAUSED,
            flag: stateAttrs.StatusStateAttribute.FLAG.NONE
        }));
    }

    async execHome() {
        this.robot.state.upsertFirstMatchingAttribute(new stateAttrs.StatusStateAttribute({
            value: stateAttrs.StatusStateAttribute.VALUE.RETURNING,
            flag: stateAttrs.StatusStateAttribute.FLAG.NONE
        }));
        const robot = this.robot;
        setTimeout(() => {
            const state = robot.state.getFirstMatchingAttributeByConstructor(stateAttrs.StatusStateAttribute);
            if(state.value !== stateAttrs.StatusStateAttribute.VALUE.RETURNING){
                return;
            }
            robot.state.upsertFirstMatchingAttribute(new stateAttrs.StatusStateAttribute({
                value: stateAttrs.StatusStateAttribute.VALUE.DOCKED,
                flag: stateAttrs.StatusStateAttribute.FLAG.NONE
            }));
        }, 3 * 1000);
    }
}

module.exports = MockBasicControlCapability;
