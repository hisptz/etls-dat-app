import { TrackedEntityModel } from "./trackedEntityModel";
import { DateTime } from "luxon";
import { TRACKED_ENTITY_ATTRIBUTES, programMapping } from "../constants";

import { TrackedEntity } from "../types";

export class PatientProfile extends TrackedEntityModel {
	programMapping?: programMapping;

	constructor(trackedEntity: TrackedEntity, programMapping: programMapping) {
		super(trackedEntity);
		this.programMapping = programMapping;
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
			this.programMapping?.attributes?.tbIdentificationNumber ?? "",
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

	get age() {
		return this.getAttributeValue(TRACKED_ENTITY_ATTRIBUTES.AGE) as string;
	}

	get phoneNumber(): string {
		return this.getAttributeValue(
			this.programMapping?.attributes?.phoneNumber ?? "",
		) as string;
	}

	get deviceIMEINumber() {
		return this.getAttributeValue(
			this.programMapping?.attributes?.deviceIMEInumber ?? "",
		) as string;
	}
	get adherenceFrequency() {
		return this.getAttributeValue(
			this.programMapping?.attributes?.adherenceFrequency ?? "",
		) as string;
	}

	get tbIdentificationNumber(): string {
		return this.getAttributeValue(
			this.programMapping?.attributes?.tbIdentificationNumber ?? "",
		) as string;
	}

	get tableData(): Record<string, any> {
		const name = this.name;
		const tbDistrictNumber = this.tbDistrictNumber;
		const tbNo = this.tbIdentificationNumber;
		const age = this.age;
		const sex = this.sex;
		const phoneNumber = this.phoneNumber;
		const deviceIMEINumber = this.deviceIMEINumber;
		const adherenceFrequency = this.adherenceFrequency;

		return {
			id: this.id as string,
			tbNo,
			tbDistrictNumber,
			name,
			age,
			sex,
			phoneNumber,
			deviceIMEINumber,
			adherenceFrequency,
		};
	}
}
