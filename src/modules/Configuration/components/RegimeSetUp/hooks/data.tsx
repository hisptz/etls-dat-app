import { useSetting } from "@dhis2/app-service-datastore";
import { useDataQuery } from "@dhis2/app-runtime";
import { RegimenSetting } from "../../../../shared/constants";
import { ProgramFormData } from "../../ProgramMapping/components/ProgramMappingForm";

const query = {
	attr: {
		resource: "trackedEntityAttributes",
		params: ({ attributeFilters }: { attributeFilters?: string }) => ({
			filter: attributeFilters,
			fields: ["id,optionSet[options[code,id,name,displayName]]"],
		}),
	},
	de: {
		resource: "dataElements",
		params: ({ dataElementFilters }: { dataElementFilters?: string }) => ({
			filter: dataElementFilters,
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
	attr: {
		trackedEntityAttributes: [{ optionSet: { options: Option[] } }];
	};
	de: {
		dataElements: [{ optionSet: { options: Option[] } }];
	};
}

export function useRegimens() {
	const [settings] = useSetting("regimenSetting", {
		global: true,
	});
	const [programMapping] = useSetting("programMapping", { global: true });

	const regimenAttributes = programMapping.map((mapping: ProgramFormData) => {
		return mapping.attributes.regimen;
	});

	const regimenDataElements = programMapping.map(
		(mapping: ProgramFormData) => {
			return mapping.regimenDataElements;
		},
	);

	const { data, loading, refetch, error } = useDataQuery<QueryType>(query, {
		variables: {
			attributeFilters: `id:in:[${regimenAttributes}]`,
			dataElementFilters: `id:in:[${regimenDataElements}]`,
		},
		lazy: !regimenAttributes || !regimenDataElements,
	});

	const options = data
		? [
				data.attr.trackedEntityAttributes.map((item: any) => item),
				data.de.dataElements.map((item: any) => item),
		  ]
		: [];

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
			attributeId: option.id,
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
				attributeId: item.attributeId,
			};
		}) ?? [];

	const allRegimenOptions: Option[] =
		regimenOptionsArray?.map((item: any) => {
			return {
				id: item.code,
				name: item.code,
				displayName: item.code,
				code: item.code,
				attributeId: item.attributeId,
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
