import { uid } from "@hisptz/dhis2-utils";
import {
	TrackedEntity,
	WebapiControllerTrackerViewRelationshipItem_Enrollment,
	WebapiControllerTrackerViewRelationshipItem_Event,
} from "../types";
import { find, head } from "lodash";
import { SHARED_ATTRIBUTES } from "../constants";

export class TrackedEntityModel {
	public instance?: TrackedEntity;
	public trackedEntity?: string;
	public trackedEntityInstance?: string;
	public attributes?: TrackedEntity["attributes"] = [];
	public enrollment?: WebapiControllerTrackerViewRelationshipItem_Enrollment;
	public events: Array<WebapiControllerTrackerViewRelationshipItem_Event> =
		[];
	public program?: string;
	public orgUnit?: string;
	private meta?: Record<string, unknown>;

	constructor(trackedEntity?: TrackedEntity) {
		const {
			trackedEntityInstance: teiId,
			enrollments,
			attributes,
			orgUnit,
			...meta
		} = trackedEntity ?? {};

		this.trackedEntityInstance = teiId ?? uid();

		if (trackedEntity) {
			this.attributes = attributes;
			this.enrollment = head(enrollments);
			this.program = this.enrollment?.program;
			this.orgUnit = orgUnit;
			this.events = this.enrollment?.events ?? [];
			this.meta = meta;
			this.instance = trackedEntity;
			return this;
		}
	}

	getAttributeValue(
		attributeId: (typeof SHARED_ATTRIBUTES)[keyof typeof SHARED_ATTRIBUTES],
	): string {
		return (
			find(this.attributes, { attribute: attributeId })?.value ??
			("" as string)
		);
	}

	getLatestEvent(
		programStage: string,
	): WebapiControllerTrackerViewRelationshipItem_Event | undefined {
		let filteredEvents = [...this.events]
			.sort((a: any, b: any) => {
				return (
					new Date(b.eventDate).getTime() -
					new Date(a.eventDate).getTime()
				);
			})
			.filter((event) => event.programStage === programStage);
		const event = filteredEvents.length ? head(filteredEvents) : undefined;
		return event;
	}

	getLatestEventValue(programStage: string, dataElement: string): string {
		const event = this.getLatestEvent(programStage);
		return (
			event?.dataValues.find(
				(dataValue) => dataValue.dataElement === dataElement,
			)?.value ?? ""
		);
	}

	toJSON(): Partial<TrackedEntity> {
		return {
			orgUnit: this.orgUnit as string,
			trackedEntity: this.trackedEntity as string,
			trackedEntityInstance: this.trackedEntityInstance as string,
			attributes: this.attributes as any[],
			enrollments: [
				{
					...(this.enrollment as any),
					events: this.events,
				},
			],
		};
	}
}
