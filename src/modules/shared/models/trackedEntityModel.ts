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
	public attributes?: TrackedEntity["attributes"] = [];
	public enrollment?: WebapiControllerTrackerViewRelationshipItem_Enrollment;
	public events: Array<WebapiControllerTrackerViewRelationshipItem_Event> =
		[];
	public program?: string;
	public orgUnit?: string;
	private meta?: Record<string, unknown>;

	constructor(trackedEntity?: TrackedEntity) {
		const {
			trackedEntity: teiId,
			enrollments,
			attributes,
			orgUnit,
			...meta
		} = trackedEntity ?? {};

		this.trackedEntity = teiId ?? uid();

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
		attributeId: (typeof SHARED_ATTRIBUTES)[keyof typeof SHARED_ATTRIBUTES]
	): string {
		return (
			find(this.attributes, { attribute: attributeId })?.value ??
			("" as string)
		);
	}

	toJSON(): Partial<TrackedEntity> {
		return {
			orgUnit: this.orgUnit as string,
			trackedEntity: this.trackedEntity as string,
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
