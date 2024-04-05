import { useSetting } from "@dhis2/app-service-datastore";
import { useDataQuery } from "@dhis2/app-runtime";
import { RegimenSetting } from "../../../../shared/constants";
import { ProgramFormData } from "../../ProgramMapping/components/ProgramMappingForm";

const query = {
	optionSet: {
		resource: "trackedEntityAttributes",
		params: ({ filters }: { filters?: string }) => ({
			filter: filters,
			fields: ["id,optionSet[options[code,id,name,displayName]]"],
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
		return item;
	});

	const result = () => {
		return options?.reduce(
			(result, currentArray) => result.concat(currentArray),
			[],
		);
	};

	const regimenOptions = result();

	const updatedOptionSets = regimenOptions?.map((option: any) => ({
		...option.optionSet?.options.map((opt: any) => ({
			...opt,
			attributeID: option.id,
		})),
	}));

	function combineNestedArrays() {
		let combinedArray: any = [];

		for (const array of updatedOptionSets ?? []) {
			combinedArray = combinedArray.concat(Object.values(array));
		}

		return combinedArray;
	}

	const sanitizedRegimenOptions = combineNestedArrays();

	const regimenOptionsArray = sanitizedRegimenOptions?.map(
		(option: any) => option,
	);

	const filteredRegimenOptions = regimenOptionsArray?.filter(
		(regimen: any) => {
			return !settings.some(
				(item: RegimenSetting) => item.regimen === regimen.code,
			);
		},
	);

	const transformedSettings: Option[] =
		filteredRegimenOptions?.map((item: any) => {
			return {
				id: item.code,
				name: item.code,
				displayName: item.code,
				code: item.code,
				attributeID: item.attributeID,
			};
		}) ?? [];

	const allRegimenOptions: Option[] =
		regimenOptionsArray?.map((item: any) => {
			return {
				id: item.code,
				name: item.code,
				displayName: item.code,
				code: item.code,
				attributeID: item.attributeID,
			};
		}) ?? [];

	return {
		loading,
		error,
		refetch,
		regimenOptions: transformedSettings,
		allRegimenOptions: allRegimenOptions,
	};
}
