import { useSetting } from "@dhis2/app-service-datastore";
import { useDataQuery } from "@dhis2/app-runtime";

const query = {
	programs: {
		resource: "programs",
		params: {
			fields: ["id", "displayName"],
		},
	},
	programID: {
		resource: "programs",
		id: ({ programID }: any) => programID,
		params: {
			fields: ["displayName"],
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
	programID: {
		displayName: string;
	};
	programAttributes: { trackedEntityAttributes: Option[] };
}

export function usePrograms() {
	const [programMapping] = useSetting("programMapping", { global: true });
	const { data, loading, refetch, error } = useDataQuery<QueryType>(query, {
		variables: {
			programID: programMapping.program ?? "",
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
		program: data?.programID,
		programOptions: programOpts,
		attributeOptions: attributeOpts,
	};
}
