import React, {useMemo} from "react";
import { DashboardItem } from "../../../../../shared/interfaces";
import {useDataQuery} from "@dhis2/app-runtime";
import {
	getCategoryOptionGroupSets,
	getCategoryOptions,
	getConfig,
	getDataItems,
	getDefaultType,
	getLayout,
	getOrganisationUnitGroupSetDimensions,
	getOrgUnits,
	getPeriods
} from "./utils/visualization";
import { FullPageLoader } from "../../../../../shared/components/Loaders";

const Visualization = React.lazy(() => import("@hisptz/dhis2-analytics").then(({Visualization}) => ({default: Visualization})));

const visualizationQuery = {
	visualization: {
		resource: "visualizations",
		id: ({id}: any) => id,
	}
};
export default function D2VisualizationContainer(
	config: DashboardItem,
): React.ReactElement {
	const {data, loading} = useDataQuery<{ visualization: any }>(visualizationQuery, {
		variables: {
			id: config.id
		}
	});
	const visualization = useMemo(() => data?.visualization, [data]);


	if (loading) {
		return (
			<FullPageLoader minHeight={400}/>
		);
	}

	return (
		<div style={{ padding: 16 }}>
			{/* Chart header */}
			{config.options?.title && (
				<div
					className="w-100 center align-center"
					style={{
						fontWeight: "bold",
						fontSize: 16,
						display: "flex",
					}}
				>
					{config.options?.title ?? data?.visualization?.displayFormName ?? data?.visualization?.displayName}
				</div>
			)}
			<div style={{ minHeight: 400 }} className="w-100 h-100 column gap-16">
				<div className="flex-1">
					<Visualization
						showToolbar
						showPeriodSelector = {false}
						layout={getLayout(visualization)}
						defaultVisualizationType={getDefaultType(visualization)}
						dimensions={{
							dx: getDataItems(visualization),
							pe: getPeriods(visualization), // TODO: add ability to fetch periods from selections
							ou: getOrgUnits(visualization), // TODO: ability to fetch periods from selections
							...getCategoryOptions(visualization),
							...getOrganisationUnitGroupSetDimensions(visualization),
							...getCategoryOptionGroupSets(visualization),
						}}
						config={getConfig(visualization, {}) as any}
					/>
				</div>
			</div>
		</div>
	);
}
