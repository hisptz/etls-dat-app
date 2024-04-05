import { useDataQuery } from "@dhis2/app-runtime";
import { type OrganisationUnit } from "@hisptz/dhis2-utils";
import { useSearchParams } from "react-router-dom";

export function useOrgUnit(ou?: string) {
	const [params, setParams] = useSearchParams();
	const values = params.get("ou") ?? ou;
	const orgUnits = values?.split(";").join(",");

	const orgUnitQuery = {
		ou: {
			resource: "organisationUnits",
			params: {
				fields: ["id", "displayName", "path", "level"],
				filter: `id:in:[${orgUnits!}]`,
			},
		},
	};

	const { refetch, data, loading } = useDataQuery<{ ou: OrganisationUnit }>(
		orgUnitQuery,
		{
			lazy: !values,
		},
	);

	return {
		loading,
		orgUnit: data?.ou.organisationUnits,
		refetch,
	};
}
