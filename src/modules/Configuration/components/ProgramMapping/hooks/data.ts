import { useSetting } from "@dhis2/app-service-datastore";
import { useDataQuery } from "@dhis2/app-runtime";
import { useMemo } from "react";
import { DEFAULT_SETTINGS } from "../../../../shared/constants";

const query = {
	highRisk: {
		resource: "optionGroups",
		id: ({ highRiskCountriesOptionGroupId }: any) =>
			highRiskCountriesOptionGroupId,
		params: {
			fields: [
				"id",
				"name",
				"shortName",
				"optionSet[id]",
				"options[id,code,name]",
				"publicAccess",
			],
		},
	},
	countries: {
		resource: "optionSets",
		id: ({ countriesOptionSetId }: any) => countriesOptionSetId,
		params: {
			fields: ["options[id,code,name]"],
		},
	},
};

export interface Option {
	id: string;
	name: string;
	code: string;
}

interface QueryType {
	highRisk: {
		options: Array<Option>;
	};
	countries: {
		options: Array<Option>;
	};
}

export function useHighRiskCountries() {
	const [settings] = useSetting("settings", { global: true });
	const { highRiskCountriesOptionGroupId, countriesOptionSetId } =
		settings ?? DEFAULT_SETTINGS.settings;
	const { data, loading, refetch, error } = useDataQuery<QueryType>(query, {
		variables: {
			highRiskCountriesOptionGroupId,
			countriesOptionSetId,
		},
	});

	const highRiskCountries = useMemo(() => {
		return data?.highRisk?.options?.map(({ code }) => code) ?? [];
	}, [data]);

	const countries = useMemo(() => {
		return data?.countries?.options ?? [];
	}, [data]);

	return {
		highRiskCountries,
		countries,
		loading,
		error,
		refetch,
		optionGroup: data?.highRisk,
	};
}
