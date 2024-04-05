import {
	WebapiControllerTrackerView_DataValue,
	WebapiControllerTrackerViewRelationshipItem_Event,
} from "../types";
import { find, fromPairs, omit } from "lodash";
import { uid } from "@hisptz/dhis2-utils";
import { DateTime } from "luxon";

export class DHIS2EventModel {
	public instance?: WebapiControllerTrackerViewRelationshipItem_Event;
	public event: string;
	public stage: string;
	public dataValues: WebapiControllerTrackerView_DataValue[];
	public occurredAt: string | number;
	private meta?: Record<string, unknown>;

	constructor({
		event,
	}: {
		event: WebapiControllerTrackerViewRelationshipItem_Event;
	}) {
		const { event: eventId, dataValues, occurredAt, ...meta } = event ?? {};
		this.event = eventId;
		this.dataValues = dataValues;
		this.stage = event.programStage;
		this.occurredAt = occurredAt;
		this.meta = meta;
		this.instance = event;
	}

	get payload(): Partial<WebapiControllerTrackerViewRelationshipItem_Event> {
		return {
			...this.instance,
			dataValues: this.dataValues ?? [],
			occurredAt: this.occurredAt,
			...this.meta,
		};
	}

	get details(): any {
		return {};
	}

	static fromForm(
		formData: Record<string, any>,
		meta: {
			orgUnit: string;
			program: string;
			programStage: string;
		},
	): DHIS2EventModel {
		const occurredAt = formData.occurredAt ?? DateTime.now().toISO();
		const event = formData.event ?? uid();
		omit(formData, ["occurredAt", "event"]);
		const dataValues = Object.entries(formData).map(
			([dataElement, value]) => {
				return { dataElement, value };
			},
		) as WebapiControllerTrackerView_DataValue[];
		return new DHIS2EventModel({
			event: {
				event,
				occurredAt,
				dataValues,
				...meta,
			} as WebapiControllerTrackerViewRelationshipItem_Event,
		});
	}

	toFormValues(): Record<string, any> {
		const values = fromPairs(
			this.dataValues.map(({ dataElement, value }) => [
				dataElement,
				value,
			]),
		);
		return {
			...values,
			occurredAt: this.occurredAt,
			event: this.event,
		};
	}

	updateFromForm(formData: Record<string, any>): DHIS2EventModel {
		this.occurredAt = formData.occurredAt;
		this.event = formData.event;
		omit(formData, ["occurredAt", "event"]);
		this.dataValues = Object.entries(formData).map(
			([dataElement, value]) => {
				return { dataElement, value };
			},
		) as WebapiControllerTrackerView_DataValue[];
		return this;
	}

	getDataValue(dataValueId: string) {
		return find(this.dataValues, { dataElement: dataValueId })?.value ?? "";
	}
}
