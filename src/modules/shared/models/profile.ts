import { TrackedEntityModel } from "./trackedEntityModel";
import { programMapping, regimenSetting } from "../constants";
import { DatDeviceInfoEventModel } from "./datDeviceInfo";
import { TrackedEntity } from "../types";
import { filter, head, isEmpty } from "lodash";
import { DateTime } from "luxon";
import { useAdherenceEvents } from "../components/ProfileArea/utils";

export class PatientProfile extends TrackedEntityModel {
	programMapping?: programMapping;
	regimenSettings?: regimenSetting[];
	datDeviceInfoEvent?: DatDeviceInfoEventModel;
	programStageID?: string;

	constructor(
		trackedEntity: TrackedEntity,
		programMapping: programMapping,
		regimenSettings: regimenSetting[],
	) {
		super(trackedEntity);
		this.programMapping = programMapping;
		this.datDeviceInfoEvent = this.getDatDeviceInfoEvent();
		this.regimenSettings = regimenSettings;
	}

	get id(): string {
		return this.trackedEntity as string;
	}

	get name() {
		return `${
			this.getAttributeValue(
				this.programMapping?.attributes?.firstName ?? "",
			) ?? ""
		} ${
			this.getAttributeValue(
				this.programMapping?.attributes?.surname ?? "",
			) ?? ""
		}`;
	}

	get tbDistrictNumber(): string {
		return this.getAttributeValue(
			this.programMapping?.attributes?.tbDistrictNumber ?? "",
		) as string;
	}

	get orgUnitFilter(): string {
		return this.enrollment?.orgUnit ?? "";
	}

	get sex() {
		const sex = this.getAttributeValue(
			this.programMapping?.attributes?.sex ?? "",
		);
		return sex == "M" ? "Male" : sex == "F" ? "Female" : null;
	}

	get enrollmentDate(): string {
		return (
			DateTime.fromISO(
				this.enrollment?.enrolledAt as string,
			).toISODate() ?? ""
		);
	}

	get age() {
		return this.getAttributeValue(
			this.programMapping?.attributes?.age ?? "",
		) as string;
	}

	get phoneNumber(): string {
		return this.getAttributeValue(
			this.programMapping?.attributes?.phoneNumber ?? "",
		) as string;
	}

	get deviceIMEINumber() {
		const device = this.getAttributeValue(
			this.programMapping?.attributes?.deviceIMEInumber ?? "",
		) as string;

		return device == "" ? "N/A" : device;
	}
	get adherenceFrequency() {
		const regimen = this.getAttributeValue(
			this.programMapping?.attributes?.regimen ?? "",
		);
		let adherenceFrequency;
		this.regimenSettings?.map((setting) => {
			if (setting.regimen === regimen) {
				adherenceFrequency = setting.administration as string;
			}
		});

		return adherenceFrequency ?? "Daily";
	}

	get deviceHealth() {
		return this.datDeviceInfoEvent?.deviceInfo.deviceHealth;
	}

	get batteryHealth() {
		return this.datDeviceInfoEvent?.deviceInfo.batteryHealth;
	}

	get dosageTime() {
		return this.datDeviceInfoEvent?.deviceInfo.dosageTime;
	}

	get deviceSignal() {
		const signal = this.datDeviceInfoEvent?.deviceInfo.deviceSignal;
		return signal;
	}

	get tableData(): Record<string, any> {
		const name = this.name;
		const tbDistrictNumber = this.tbDistrictNumber;
		const tbIdentificationNumber = this.tbDistrictNumber;
		const age = this.age;
		const sex = this.sex;
		const phoneNumber = this.phoneNumber;
		const deviceIMEINumber = this.deviceIMEINumber;
		const adherenceFrequency = this.adherenceFrequency;
		const deviceHealth = this.deviceHealth;
		const batteryHealth = this.batteryHealth;
		const dosageTime = this.dosageTime;
		const enrollmentDate = this.enrollmentDate;
		const deviceSignal = this.deviceSignal;

		const { filteredEvents } = useAdherenceEvents(
			this.events,
			this.programMapping?.programStage ?? "",
		);

		const MissedDoses = filteredEvents.filter((item: any) => {
			return item.dataValues.some(
				(dataValue: any) => dataValue.value === "Heartbeat",
			);
		});

		const numberOfMissedDoses = MissedDoses.length;

		const takenDoses = filteredEvents.filter((item: any) => {
			return item.dataValues.some((dataValue: any) => {
				const value = dataValue.value;
				return value === "Once" || value === "Multiple";
			});
		});

		const percentage = !isEmpty(this.regimenSettings)
			? this.regimenSettings.map((option: regimenSetting) => {
					if (option.administration == this.adherenceFrequency) {
						return (
							(
								(takenDoses.length /
									parseInt(option.idealDoses)) *
								100
							).toFixed(2) + "%"
						);
					} else {
						return "N/A";
					}
			  })
			: "N/A";

		const adherencePercentage = percentage != "N/A" ? percentage[0] : "N/A";

		return {
			id: this.id as string,
			tbDistrictNumber,
			tbIdentificationNumber,
			name,
			age,
			sex,
			phoneNumber,
			deviceIMEINumber,
			adherenceFrequency,
			deviceHealth,
			batteryHealth,
			dosageTime,
			enrollmentDate,
			deviceSignal,
			adherencePercentage,
			numberOfMissedDoses,
		};
	}

	private getDatDeviceInfoEvent(): DatDeviceInfoEventModel {
		const events = filter(this.events, [
			"programStage",
			this.programStageID,
		]).map((event) => new DatDeviceInfoEventModel({ event: event }));
		return head(events) as DatDeviceInfoEventModel;
	}
}
