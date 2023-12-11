import { useSetting } from "@dhis2/app-service-datastore";
import { useDataQuery } from "@dhis2/app-runtime";
import { regimenSetting } from "../../../../shared/constants";
import { ProgramFormData } from "../../ProgramMapping/components/EditProgramMapping";

const query = {
	optionSet: {
		resource: "trackedEntityAttributes",
		params: ({ filters }: { filters?: string }) => ({
			filter: filters,
			fields: ["optionSet[options[code,id,name,displayName]]"],
		}),
	},
};

export interface Option {
	id: string;
	name: string;
	displayName: string;
	code: string;
}

interface QueryType {
	optionSet: {
		trackedEntityAttributes: [{ optionSet: { options: Option[] } }];
	};
}

export function useRegimens() {
	const [settings] = useSetting("regimenSetting", {
		global: true,
	});
	const [programMapping] = useSetting("programMapping", { global: true });

	const regimens = programMapping.map((mapping: ProgramFormData) => {
		return mapping.attributes.regimen;
	});

	const { data, loading, refetch, error } = useDataQuery<QueryType>(query, {
		variables: {
			filters: `id:in:[${regimens}]`,
		},
		lazy: !regimens,
	});

	const options = data?.optionSet.trackedEntityAttributes.map((item: any) => {
		return item.optionSet.options;
	});

	const result = () => {
		return options?.reduce(
			(result, currentArray) => result.concat(currentArray),
			[],
		);
	};

	const regimenOptions = result();
	const regimenOptionsArray = regimenOptions?.map((option) => option.code);
	const filteredRegimenOptions = regimenOptionsArray?.filter((regimen) => {
		return !settings.some(
			(item: regimenSetting) => item.regimen === regimen,
		);
	});
	const transformedSettings: Option[] =
		filteredRegimenOptions?.map((item: string) => {
			return {
				id: item,
				name: item,
				displayName: item,
				code: item,
			};
		}) ?? [];

	return {
		loading,
		error,
		refetch,
		regimenOptions: transformedSettings,
	};
}
