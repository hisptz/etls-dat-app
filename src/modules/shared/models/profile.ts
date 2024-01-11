import { TrackedEntityModel } from "./trackedEntityModel";
import { ProgramMapping, RegimenSetting } from "../constants";
import { DatDeviceInfoEventModel } from "./datDeviceInfo";
import { TrackedEntity } from "../types";
import { filter, head } from "lodash";
import { DateTime } from "luxon";

export class PatientProfile extends TrackedEntityModel {
	programMapping?: ProgramMapping;
	regimenSettings?: RegimenSetting[];
	datDeviceInfoEvent?: DatDeviceInfoEventModel;

	constructor(
		trackedEntity: TrackedEntity,
		programMapping: ProgramMapping,
		regimenSettings: RegimenSetting[],
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

	get patientNumber(): string {
		return this.getAttributeValue(
			this.programMapping?.attributes?.patientNumber ?? "",
		) as string;
	}

	get organisationUnit(): string {
		return this.enrollment?.orgUnitName ?? "";
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
		const patientNumber = this.patientNumber;
		const tbIdentificationNumber = this.patientNumber;
		const age = this.age;
		const sex = this.sex;
		const phoneNumber = this.phoneNumber;
		const deviceIMEInumber = this.deviceIMEINumber;
		const adherenceFrequency = this.adherenceFrequency;
		const deviceHealth = this.deviceHealth;
		const batteryHealth = this.batteryHealth;
		const dosageTime = this.dosageTime;
		const enrollmentDate = this.enrollmentDate;
		const deviceSignal = this.deviceSignal;
		const orgUnit = this.organisationUnit;

		return {
			id: this.id as string,
			patientNumber,
			tbIdentificationNumber,
			name,
			age,
			sex,
			phoneNumber,
			deviceIMEInumber,
			orgUnit,
			adherenceFrequency,
			deviceHealth,
			batteryHealth,
			dosageTime,
			enrollmentDate,
			deviceSignal,
		};
	}

	private getDatDeviceInfoEvent(): DatDeviceInfoEventModel {
		const events = filter(this.events, [
			"programStage",
			this.programMapping?.programStage,
		]).map((event) => new DatDeviceInfoEventModel({ event: event }));

		return head(events) as DatDeviceInfoEventModel;
	}
}
