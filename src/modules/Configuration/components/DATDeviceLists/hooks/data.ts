import { useSetting } from "@dhis2/app-service-datastore";
import { useDataQuery } from "@dhis2/app-runtime";
import { useMemo } from "react";
import { DEFAULT_SETTINGS } from "../../../../shared/constants";

const query = {
	yellowFever: {
		resource: "optionGroups",
		id: ({ yellowFeverCountriesOptionGroupId }: any) =>
			yellowFeverCountriesOptionGroupId,
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
	yellowFever: {
		options: Array<Option>;
	};
	countries: {
		options: Array<Option>;
	};
}

export function useYellowFeverCountries() {
	const [settings] = useSetting("settings", { global: true });
	const { yellowFeverCountriesOptionGroupId, countriesOptionSetId } =
		settings ?? DEFAULT_SETTINGS.settings;
	const { data, loading, refetch, error } = useDataQuery<QueryType>(query, {
		variables: {
			yellowFeverCountriesOptionGroupId,
			countriesOptionSetId,
		},
	});

	const yellowFeverCountries = useMemo(() => {
		return data?.yellowFever?.options?.map(({ code }) => code) ?? [];
	}, [data]);

	const countries = useMemo(() => {
		return data?.countries?.options ?? [];
	}, [data]);

	return {
		yellowFeverCountries,
		countries,
		loading,
		error,
		refetch,
		optionGroup: data?.yellowFever,
	};
}
