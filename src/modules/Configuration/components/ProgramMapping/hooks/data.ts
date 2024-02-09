import { useSetting } from "@dhis2/app-service-datastore";
import { useDataQuery } from "@dhis2/app-runtime";
import { ProgramFormData } from "../components/ProgramMappingForm";

const query = {
	programs: {
		resource: "programs",
		params: {
			fields: [
				"id",
				"displayName",
				"programTrackedEntityAttributes[trackedEntityAttribute[id,name,code,optionSet[id]]]",
			],
			filter: "programType:eq:WITH_REGISTRATION",
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
			paging: false,
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
	optionSet?: { id: string };
}

interface QueryType {
	programs: {
		programs: Option[];
	};
	programID: {
		displayName: string;
	};
}

export function usePrograms() {
	const { data, loading, refetch, error } = useDataQuery<QueryType>(
		query,
		{},
	);

	const programOpts: any[] = [];

	data?.programs.programs.map((prog) => {
		const newProgram = {
			...prog,
			code: prog.id,
			name: prog.displayName,
			optionSet: prog.optionSet?.id,
			programTrackedEntityAttributes:
				prog.programTrackedEntityAttributes.map((attribute: any) => {
					return {
						code: attribute.trackedEntityAttribute.id,
						id: attribute.trackedEntityAttribute.id,
						name: attribute.trackedEntityAttribute.name,
						optionSet: attribute.trackedEntityAttribute.optionSet,
					};
				}),
		};
		programOpts.push(newProgram);
	});

	return {
		loading,
		error,
		refetch,
		programOptions: programOpts,
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
