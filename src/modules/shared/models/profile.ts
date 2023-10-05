import { TrackedEntityModel } from "./trackedEntityModel";
import { DateTime } from "luxon";
import {
	DATA_ELEMENTS,
	EXPIRE_DAYS,
	SHARED_ATTRIBUTES,
	TRACKED_ENTITY_ATTRIBUTES,
} from "../constants";

import { Option, TrackedEntity } from "../types";
import { filter, find, forIn, head, isEmpty } from "lodash";

export class PatientProfile extends TrackedEntityModel {
	constructor(trackedEntity: TrackedEntity) {
		super(trackedEntity);
	}

	get id(): string {
		return this.trackedEntity as string;
	}

	get name() {
		return `${
			this.getAttributeValue(TRACKED_ENTITY_ATTRIBUTES.FIRST_NAME) ?? ""
		} ${this.getAttributeValue(TRACKED_ENTITY_ATTRIBUTES.SURNAME) ?? ""}`;
	}

	get tbDistrictNumber(): string {
		return this.getAttributeValue(
			SHARED_ATTRIBUTES.TB_DISTRICT_NUMBER
		) as string;
	}

	get orgUnitFilter(): string {
		return this.enrollment?.orgUnit ?? "";
	}

	get sex() {
		return this.getAttributeValue(TRACKED_ENTITY_ATTRIBUTES.SEX);
	}

	get age() {
		return this.getAttributeValue(TRACKED_ENTITY_ATTRIBUTES.AGE) as string;
	}

	get phoneNumber(): string {
		return this.getAttributeValue(
			TRACKED_ENTITY_ATTRIBUTES.PHONE_NUMBER
		) as string;
	}

	get tbIdentificationNumber(): string {
		return this.getAttributeValue(
			TRACKED_ENTITY_ATTRIBUTES.TB_NO
		) as string;
	}

	get tableData(): Record<string, any> {
		const name = this.name;
		const tbDistrictNumber = this.tbDistrictNumber;
		const tbNo = this.tbIdentificationNumber;
		const age = this.age;
		const sex = this.sex;
		const phoneNumber = this.phoneNumber;

		return {
			id: this.id as string,
			tbNo,
			tbDistrictNumber,
			name,
			age,
			sex,
			phoneNumber,
		};
	}
}
