import { useSetting } from "@dhis2/app-service-datastore";
import { Query } from "../interfaces";

export const DATA_TEST_PREFIX = "d2-dat";
export const DATASTORE_NAMESPACE = "test-dat-app";
export const DAT_PROGRAM = (): string => {
	const [programMapping] = useSetting("programMapping", {
		global: true,
	});
	const program = programMapping.program;
	return program;
};

export const TEI_FIELDS = [
	"trackedEntity",
	"created",
	"lastUpdated",
	"orgUnit",
	"attributes[*]",
	"enrollments[orgUnitName,enrollment,enrolledAt,orgUnit,program,events[event,dataValues,programStage,enrollment,occurredAt,program,orgUnit]]",
];

export const CURRENT_USER_QUERY: Query = {
	me: {
		resource: "me",
		params: {
			fields: "id,name,userGroups,organisationUnits[id,displayName,path]",
		},
	},
};
