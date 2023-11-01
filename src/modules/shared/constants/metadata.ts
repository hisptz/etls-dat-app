import { useSetting } from "@dhis2/app-service-datastore";

export const DATA_TEST_PREFIX = "d2-dat";
export const DATASTORE_NAMESPACE = "hisptz-dat-app";
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
