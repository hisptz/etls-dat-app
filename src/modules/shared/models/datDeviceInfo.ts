import { DHIS2EventModel } from "./event";
import { DATA_ELEMENTS } from "../constants";

export class DatDeviceInfoEventModel extends DHIS2EventModel {
	get deviceInfo(): {
		deviceHealth: string;
		batteryHealth: string;
		dosageTime: string;
	} {
		return {
			deviceHealth: this.getDataValue(DATA_ELEMENTS.DEVICE_HEALTH),
			batteryHealth: this.getDataValue(DATA_ELEMENTS.BATTERY_HEALTH),
			dosageTime: this.getDataValue(DATA_ELEMENTS.DOSAGE_TIME),
		};
	}
}
