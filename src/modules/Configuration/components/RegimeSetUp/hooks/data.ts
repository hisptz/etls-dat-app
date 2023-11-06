import { useSetting } from "@dhis2/app-service-datastore";
import { useDataQuery } from "@dhis2/app-runtime";
import { regimenSetting } from "../../../../shared/constants";

const query = {
	optionSet: {
		resource: "trackedEntityAttributes",
		id: ({ optionsID }: any) => optionsID,
		params: {
			fields: ["optionSet[options[code,id,name,displayName]]"],
		},
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
		optionSet: {
			options: Option[];
		};
	};
}

export function useRegimens() {
	const [programMapping] = useSetting("programMapping", { global: true });
	const [settings] = useSetting("regimenSetting", {
		global: true,
	});
	const { data, loading, refetch, error } = useDataQuery<QueryType>(query, {
		variables: {
			optionsID: programMapping.attributes.regimen ?? "",
		},
		lazy: !programMapping.attributes.regimen,
	});

	const regimenOptions = data?.optionSet.optionSet.options;
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
