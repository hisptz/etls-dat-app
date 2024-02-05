import React from "react";
import i18n from "@dhis2/d2-i18n";
import { map } from "lodash";
import { useDataQuery } from "@dhis2/app-runtime";
import { FilterField } from "../../../../Configuration/components/ProgramMapping/components/FilterField";

const VisualizationQuery = {
	d2Visualizations: {
		resource: "visualizations",
		params: {
			fields: ["id", "displayName"],
			page: 1,
			pageSize: 50,
		},
	},
};

export default function VisualizationOptionsField() {
	const { data, loading, error } = useDataQuery(VisualizationQuery);

	const visualizations: Array<{ name: string; code: string }> = map(
		((data?.d2Visualizations as any)?.visualizations ?? []) as Array<{
			id: string;
			displayName: string;
		}>,
		({ id, displayName }: any) => ({ code: id, name: displayName }),
	);

	return error ? (
		<p>{i18n.t("Failed to Load DHIS2 visualization")}</p>
	) : (
		<FilterField
			options={visualizations}
			label={i18n.t("Dashboard Item")}
			name="dashboardItem"
			type="select"
			loading={loading}
			required
		/>
	);
}
