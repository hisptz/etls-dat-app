import { useSetting } from "@dhis2/app-service-datastore";
import { useDataQuery } from "@dhis2/app-runtime";
import { useMemo } from "react";
import { DAT_PROGRAM, DEFAULT_SETTINGS } from "../../../../shared/constants";
import { useSearchParams } from "react-router-dom";

const query = {
	programs: {
		resource: "programs",
		params: {
			fields: ["id", "displayName"],
		},
	},
	programAttributes: {
		resource: "trackedEntityAttributes",
		params: {
			fields: ["id", "name", "code"],
			paging: false,
		},
	},
};

export interface Option {
	id: string;
	displayName: string;
	name: string;
	code: string;
}

interface QueryType {
	programs: {
		programs: Option[];
	};
	programAttributes: { trackedEntityAttributes: Option[] };
}

export function usePrograms() {
	const [params, setParams] = useSearchParams();
	const programId = params.get("mapped-tb-program");
	const { data, loading, refetch, error } = useDataQuery<QueryType>(query, {
		variables: {
			program: programId,
		},
	});

	const programOpts: Option[] = [];
	const attributeOpts: Option[] = [];
	data?.programs.programs.map((prog) => {
		const newProgram = {
			...prog,
			code: prog.id,
			name: prog.displayName,
		};
		programOpts.push(newProgram);
	});
	data?.programAttributes.trackedEntityAttributes.map((attribute) => {
		const newAttribute = {
			...attribute,
			code: attribute.id,
		};
		attributeOpts.push(newAttribute);
	});

	return {
		loading,
		error,
		refetch,
		programOptions: programOpts,
		attributeOptions: attributeOpts,
	};
}
