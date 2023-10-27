import { useSetting } from "@dhis2/app-service-datastore";
import { useDataQuery } from "@dhis2/app-runtime";

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
	const { data, loading, refetch, error } = useDataQuery<QueryType>(query, {
		variables: {
			optionsID: programMapping.attributes.regimen ?? "",
		},
		lazy: true,
	});
	const administrationOptions: Option[] = [
		{ name: "Daily", code: "Daily", id: "Daily", displayName: "Daily" },
		{ name: "Weekly", code: "Weekly", id: "Weekly", displayName: "Weekly" },
		{
			name: "Monthly",
			code: "Monthly",
			id: "Monthly",
			displayName: "Monthly",
		},
	];

	return {
		loading,
		error,
		refetch,
		regimenOptions: data?.optionSet.optionSet.options,
		administrationOptions,
	};
}
