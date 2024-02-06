import React, { useMemo } from "react";
import { DashboardItem } from "../../../../../shared/interfaces";
import { useDataQuery } from "@dhis2/app-runtime";
import {
	getCategoryOptionGroupSets,
	getCategoryOptions,
	getConfig,
	getDataItems,
	getDefaultType,
	getLayout,
	getOrgUnits,
	getOrganisationUnitGroupSetDimensions,
	getPeriods,
} from "./utils/visualization";
import { FullPageLoader } from "../../../../../shared/components/Loaders";
import { useSearchParams } from "react-router-dom";
import { DashboardFilterState } from "../../../../states/dashboardsHeader";
import { useRecoilValue } from "recoil";

const Visualization = React.lazy(() =>
	import("@hisptz/dhis2-analytics").then(({ Visualization }) => ({
		default: Visualization,
	})),
);

const visualizationQuery = {
	visualization: {
		resource: "visualizations",
		id: ({ id }: any) => id,
	},
};
export default function D2VisualizationContainer(
	config: DashboardItem,
): React.ReactElement {
	const [searchParams] = useSearchParams();
	const { orgUnit: selectedOrgUnits, periods: selectedPeriods } =
		useRecoilValue(DashboardFilterState);
	const { data, loading } = useDataQuery<{ visualization: any }>(
		visualizationQuery,
		{
			variables: {
				id: config.id,
			},
		},
	);
	const visualization = useMemo(() => data?.visualization, [data]);

	if (loading) {
		return <FullPageLoader minHeight={400} message={"Loading"} />;
	}

	const ouParams = searchParams.get("ou");
	const peParams = searchParams.get("pe");

	const pe: string[] = peParams
		? peParams.split(";")
		: getPeriods(visualization) ?? [];
	const ou: string[] = ouParams
		? ouParams.split(";")
		: getOrgUnits(visualization);

	return (
		<div style={{ padding: 16 }}>
			{/* Chart header */}
			{
				<div
					className="w-100 center align-center"
					style={{
						fontWeight: "bold",
						fontSize: 16,
						display: "flex",
						minHeight: 30,
					}}
				>
					{config.options?.title ??
						data?.visualization?.displayName ??
						""}
				</div>
			}

			{/* Visualization contents */}
			<div
				style={{ minHeight: 400 }}
				className="w-100 h-100 column gap-16"
			>
				<div className="flex-1">
					<Visualization
						showToolbar
						showPeriodSelector={true}
						layout={getLayout(visualization)}
						defaultVisualizationType={getDefaultType(visualization)}
						dimensions={{
							pe,
							ou,
							dx: getDataItems(visualization),
							...getCategoryOptions(visualization),
							...getOrganisationUnitGroupSetDimensions(
								visualization,
							),
							...getCategoryOptionGroupSets(visualization),
						}}
						config={getConfig(visualization, {}) as any}
					/>
				</div>
			</div>
		</div>
	);
}
