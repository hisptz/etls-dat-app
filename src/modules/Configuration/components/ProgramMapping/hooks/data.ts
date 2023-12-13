import { useSetting } from "@dhis2/app-service-datastore";
import { useDataQuery } from "@dhis2/app-runtime";
import { ProgramFormData } from "../components/ProgramMappingForm";

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

const programQuery = {
	programID: {
		resource: "programs",
		params: ({ filters }: { filters?: string }) => ({
			filter: filters,
			fields: ["id, displayName"],
		}),
	},
};

interface ProgramQueryType {
	programID: {
		programs: [
			{
				displayName: string;
				id: string;
			},
		];
	};
}

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
	const { data, loading, refetch, error } = useDataQuery<QueryType>(
		query,
		{},
	);

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

export function useProgramName() {
	const [programMapping] = useSetting("programMapping", { global: true });

	const programIDs = programMapping.map((mapping: ProgramFormData) => {
		return mapping.program;
	});

	const { data, loading, refetch, error } = useDataQuery<ProgramQueryType>(
		programQuery,
		{
			variables: {
				filters: `id:in:[${programIDs}]`,
			},
			lazy: !programIDs,
		},
	);

	return {
		loadingNames: loading,
		error,
		refetch,
		programName: data?.programID.programs,
	};
}
