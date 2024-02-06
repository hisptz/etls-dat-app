import Highcharts from "highcharts";
import { camelCase, fromPairs, isEmpty, snakeCase } from "lodash";
import { colorSets, supportedCharts } from "../constants";

function getLayout(visualization: any) {
	return {
		rows: (visualization?.rows ?? []).map((row: any) => row.id),
		columns: (visualization?.columns ?? []).map((col: any) => col.id),
		filters: (visualization?.filters ?? []).map((filter: any) => filter.id),
	};
}

function getDefaultType(visualization: any) {
	if (supportedCharts.includes(visualization?.type)) {
		return "chart";
	}

	if (["PIVOT_TABLE"].includes(visualization?.type)) {
		return "pivotTable";
	}

	if (["MAP"].includes(visualization?.type)) {
		return "map";
	}

	return visualization?.type;
}

function getChartType(type: string): string {
	if (["COLUMN"].includes(type)) {
		return "column";
	}
	if (["STACKED_COLUMN"].includes(type)) {
		return "stacked-column";
	}
	if (["STACKED_BAR"].includes(type)) {
		return "stacked-bar";
	}
	return type.toLowerCase();
}

function getConfig(visualization: any, { height }: { height?: number }) {
	const type = getDefaultType(visualization);
	const colorSetId: keyof typeof colorSets = visualization?.colorSet as any;
	const colors: Array<any | string> = (colorSets[colorSetId] as any)
		?.colors ??
		(colorSets[colorSetId] as any)?.pattern ?? [
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
	const layout = getLayout(visualization);
	const sortOrder = visualization?.sortOrder;

	switch (type) {
		case "chart":
			return {
				chart: {
					type: getChartType(visualization?.type),
					layout: {
						filter: layout.filters,
						series: layout.columns,
						category: layout.rows,
					},
					highChartOverrides: (options: Highcharts.Options) => {
						const series = options.series?.map((series) => {
							return {
								...series,
								dataSorting: {
									enabled: sortOrder !== 0,
								},
							};
						});
						return {
							...options,
							series,
							xAxis: {
								...options.xAxis,
								reversed: sortOrder === -1,
							},
						};
					},
					colors,
					height,
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
}

function getDataItems(visualization: any) {
	return visualization?.dataDimensionItems?.map(
		(item: any) => item[camelCase(item.dataDimensionItemType)]?.id,
	);
}

function getPeriods(visualization: any) {
	const periods = (visualization?.periods ?? []).map(
		({ id }: { id: string }) => id,
	);
	const relativePeriods = Object.keys(
		visualization?.relativePeriods ?? [],
	).filter((key) => visualization?.relativePeriods[key]);
	return [
		...periods,
		...relativePeriods.map((period) => snakeCase(period).toUpperCase()),
	];
}

function getOrgUnits(visualization: any) {
	const orgUnits = visualization?.organisationUnits ?? [];
	const orgUnitLevels = visualization?.organisationUnitLevels ?? [];
	const orgUnitGroups = visualization?.itemOrganisationUnitGroups ?? [];
	if (!isEmpty(orgUnits)) {
		const orgUnitIds = orgUnits.map((orgUnit: any) => orgUnit.id);

		if (!isEmpty(orgUnitLevels)) {
			orgUnitLevels.forEach((level: number) => {
				orgUnitIds.push(`LEVEL-${level}`);
			});
		}
		if (!isEmpty(orgUnitGroups)) {
			orgUnitGroups.forEach((group: { id: string }) => {
				orgUnitIds.push(`OU_GROUP-${group.id}`);
			});
		}

		return orgUnitIds;
	}
	const userOrgUnits = [];

	if (visualization?.userOrganisationUni) {
		userOrgUnits.push("USER_ORGUNIT");
	}
	if (visualization?.userOrganisationUnitChildren) {
		userOrgUnits.push("USER_ORGUNIT_CHILDREN");
	}
	if (visualization?.userOrganisationUnitGrandChildren) {
		userOrgUnits.push("USER_ORGUNIT_GRANDCHILDREN");
	}

	return userOrgUnits;
}

function getCategoryOptionGroupSets(visualization: any) {
	if (visualization?.categoryOptionGroupSetDimensions) {
		return fromPairs(
			visualization?.categoryOptionGroupSetDimensions.map(
				({ categoryOptionGroupSet, categoryOptionGroups }: any) => [
					categoryOptionGroupSet.id,
					categoryOptionGroups.map((option: any) => option.id),
				],
			),
		);
	}

	return {};
}

function getCategoryOptions(visualization: any) {
	if (visualization?.categoryDimensions) {
		return fromPairs(
			visualization?.categoryDimensions.map(
				({ category, categoryOptions }: any) => [
					category.id,
					categoryOptions.map((option: any) => option.id),
				],
			),
		);
	}
	return {};
}

function getOrganisationUnitGroupSetDimensions(visualization: any) {
	if (visualization?.organisationUnitGroupSetDimensions) {
		return fromPairs(
			visualization?.organisationUnitGroupSetDimensions.map(
				({ organisationUnitGroupSet, organisationUnitGroups }: any) => [
					organisationUnitGroupSet.id,
					organisationUnitGroups.map((option: any) => option.id),
				],
			),
		);
	}
	return {};
}

export {
	getLayout,
	getDefaultType,
	getConfig,
	getDataItems,
	getPeriods,
	getOrganisationUnitGroupSetDimensions,
	getCategoryOptionGroupSets,
	getCategoryOptions,
	getOrgUnits,
	getChartType,
};
