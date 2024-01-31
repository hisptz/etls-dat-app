import { useSetting } from "@dhis2/app-service-datastore";

import { Query } from "../interfaces";
import { useSearchParams } from "react-router-dom";
import { getProgramMapping } from "../utils";

export const DATA_TEST_PREFIX = "d2-dat";
export const DATASTORE_NAMESPACE = "dat-app";
export const USERGROUP_CODE = "DAT_MANAGE";
export const DAT_PROGRAM = (): string => {
	const [programMapping] = useSetting("programMapping", {
		global: true,
	});
	const [params] = useSearchParams();
	const currentProgram = params.get("program");
	const mapping = getProgramMapping(programMapping, currentProgram) ?? {};
	const program = mapping.program ?? "";
	return program;
};

export const TEI_FIELDS = [
	"trackedEntity",
	"trackedEntityType",
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
			fields: "id,name,userGroups[id,code],organisationUnits[id,displayName,path]",
		},
	},
};
