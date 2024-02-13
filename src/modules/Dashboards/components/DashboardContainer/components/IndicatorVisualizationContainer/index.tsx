import React from "react";
import Highcharts from "highcharts";
import { flattenDeep, keys } from "lodash";
import { DashboardItem } from "../../../../../shared/interfaces";

import { useSearchParams } from "react-router-dom";
import { VisualizationType } from "@hisptz/dhis2-analytics/build/types/components/Visualization/components/VisualizationTypeProvider";

const Visualization = React.lazy(() =>
	import("@hisptz/dhis2-analytics").then(({ Visualization }) => ({
		default: Visualization,
	})),
);

export default function IndicatorVisualizationContainer(
	config: DashboardItem,
): React.ReactElement {
	const [searchParams] = useSearchParams();
	const ouParams = searchParams.get("ou");
	const peParams = searchParams.get("pe");

	const getPeriods = (config: DashboardItem): string[] => {
		const { options } = config;
		const { category, series, rows, columns, filters } = options ?? {};
		const metadata = {
			...category,
			...rows,
			...columns,
			...series,
			...filters,
		};

		const periods = flattenDeep(metadata?.pe ?? []) as string[];
		return periods;
	};

	const getOrgUnits = (config: DashboardItem): string[] => {
		const { options } = config;
		const { category, series, rows, columns, filters } = options ?? {};
		const metadata = {
			...category,
			...rows,
			...columns,
			...series,
			...filters,
		};
		return flattenDeep(metadata?.ou ?? []) as string[];
	};

	const getDataItems = (config: DashboardItem): string[] => {
		const { options } = config;
		const { category, series, rows, columns, filters } = options ?? {};
		const metadata = {
			...category,
			...rows,
			...columns,
			...series,
			...filters,
		};
		return flattenDeep(metadata?.dx ?? []) as string[];
	};

	const getChartType = (config: DashboardItem): string => {
		const { options } = config;
		const { chartType: type } = options ?? {};

		if (type) {
			if (["COLUMN"].includes(type)) {
				return "column";
			} else if (["STACKED_COLUMN"].includes(type)) {
				return "stacked-column";
			} else if (["STACKED_BAR"].includes(type)) {
				return "stacked-bar";
			}
		}
		return "column";
	};

	const getLayout = (config: DashboardItem): any => {
		const { options } = config;
		const { filters, columns, series, rows, category } = options ?? {};
		return {
			filters: keys(filters),
			columns: keys(columns),
			series: keys(series),
			rows: keys(rows),
			category: keys(category),
		};
	};

	const getVisualizationConfig = (config: DashboardItem): any => {
		const layout = getLayout(config);
		const colors: string[] = [
			"#a8bf24",
			"#518cc3",
			"#d74554",
			"#ff9e21",
			"#968f8f",
			"#ba3ba1",
			"#ffda54",
			"#45beae",
			"#b98037",
			"#676767",
			"#6b2dd4",
			"#47792c",
			"#fcbdbd",
			"#830000",
			"#a5ffc0",
			"#000078",
			"#817c00",
			"#bdf023",
			"#fffac4",
		];

		switch (getVisualizationType(config)) {
			case "chart":
				return {
					chart: {
						type: getChartType(config),
						layout: {
							filter: layout.filters,
							series: layout.columns,
							category: layout.rows,
						},
						highChartOverrides: (options: Highcharts.Options) => {
							const series = options.series?.map((series) => {
								return {
									...series,
								};
							});
							return {
								...options,
								series,
								xAxis: {
									...options.xAxis,
								},
							};
						},
						colors,
					},
				};
			case "pivotTable":
				return {
					pivotTable: {
						fixColumnHeaders: true,
						fixRowHeaders: true,
					},
				};
		}
	};

	const getVisualizationType = (config: DashboardItem): VisualizationType => {
		const { options } = config;
		const type = (options?.renderAs ?? "").toLowerCase();
		return type.includes("table")
			? "pivotTable"
			: type.includes("map")
			? "map"
			: "chart";
	};

	const pe: string[] = peParams
		? peParams.split(";")
		: getPeriods(config) ?? [];
	const ou: string[] = ouParams ? ouParams.split(";") : getOrgUnits(config);

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
					{config.options?.title ?? ""}
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
						showPeriodSelector={false}
						layout={getLayout(config)}
						defaultVisualizationType={getVisualizationType(config)}
						dimensions={{
							pe,
							ou,
							dx: getDataItems(config),
						}}
						config={getVisualizationConfig(config) as any}
					/>
				</div>
			</div>
		</div>
	);
}
