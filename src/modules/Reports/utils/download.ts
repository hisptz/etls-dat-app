import * as XLSX from "xlsx";
import i18n from "@dhis2/d2-i18n";
import { asyncify, mapSeries } from "async-es";
import { useAlert, useDataQuery } from "@dhis2/app-runtime";
import { useCallback, useEffect, useState } from "react";
import { Pagination } from "@hisptz/dhis2-utils";
import { flattenDeep, get, isEmpty, range } from "lodash";
import { saveAs } from "file-saver";
import { useRecoilState } from "recoil";
import {
	ReportConfig,
	programMapping,
	regimenSetting,
} from "../../shared/constants";
import { SelectedReport } from "../components/Table/FilterArea/components/FilterField";
import {
	sanitizeReportData,
	transformRowsData,
} from "../components/Table/hooks/data";
import { useSetting } from "@dhis2/app-service-datastore";
import { useSearchParams } from "react-router-dom";

export async function downloadFile(
	type: "xlsx" | "json" | "csv",
	data: any[],
	filename?: string,
) {
	if (type === "json") {
		saveAs(
			new File([JSON.stringify(data)] as any, "data.json", {
				type: "json",
			}),
			`${filename ?? "data"}.json`,
		);
	} else if (type === "xlsx") {
		const excel = await import("xlsx");
		const workbook = excel.utils.book_new();
		const worksheet = excel.utils.json_to_sheet(data);
		excel.utils.book_append_sheet(workbook, worksheet, "data");
		excel.writeFile(workbook, `${filename ?? "data"}.xlsx`);
	} else if (type === "csv") {
		const excel = await import("xlsx");
		const worksheet = excel.utils.json_to_sheet(data);
		const csvData = excel.utils.sheet_to_csv(worksheet);
		saveAs(
			new File([csvData], "data.csv", {
				type: "csv",
			}),
			`${filename ?? "data"}.csv`,
		);
	}
}

async function getPagination(
	refetch: any,
	{
		queryVariables,
		queryKey,
	}: { queryVariables: Record<string, any>; queryKey: string },
): Promise<Pagination> {
	const data = await refetch({
		...queryVariables,
		totalPages: true,
		skipData: true,
	});

	return {
		page: get(data, [queryKey, "metaData"]).pager.page,
		total: get(data, [queryKey, "metaData"]).pager.total,
		pageSize: get(data, [queryKey, "metaData"]).pager.pageSize,
	} as Pagination;
}

async function getData(
	refetch: any,
	{
		options,
		queryKey,
		resource,
		mapping,
		page,
		programMapping,
		regimenSetting,
	}: {
		options: any;
		queryKey: string;
		resource: string;
		mapping: any;
		page: number;
		programMapping: programMapping;
		regimenSetting: regimenSetting[];
	},
): Promise<Array<Record<string, any>>> {
	const data = await refetch({ ...options, page });

	const rawData = data[queryKey];

	const rows = transformRowsData(rawData.headers, rawData.rows);

	const finalEventData = sanitizeReportData(
		rows,
		regimenSetting,
		programMapping,
	);

	if (!isEmpty(finalEventData)) {
		return finalEventData.map(mapping);
	}
	return [];
}

export function useDownloadData({
	query,
	queryKey,
	resource,
	mapping,
}: {
	query: any;
	queryKey: string;
	resource: string;
	mapping: (data: any) => Record<string, any>;
}) {
	const { show, hide } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 55000 }),
	);

	const [downloading, setDownloading] = useState(false);
	const [pageCount, setPageCount] = useState(0);
	const [params] = useSearchParams();
	const [progress, setProgress] = useState(0);
	const [report] = useRecoilState<ReportConfig>(SelectedReport);
	const [programMapping] = useSetting("programMapping", {
		global: true,
	});
	const [regimenSetting] = useSetting("regimenSetting", {
		global: true,
	});
	const [reportConfigs] = useSetting("reports", { global: true });
	const reportType = params.get("reportType");

	const { refetch } = useDataQuery(query, { lazy: true });

	useEffect(() => {
		if (downloading && pageCount > 0) {
			show({
				type: {
					info: true,
				},
				message: `${i18n.t("Downloading...")} ${progress}/${pageCount}`,
			});
		} else {
			hide();
		}
	}, [progress, show, downloading, pageCount, hide]);

	const download = useCallback(
		async (
			type: "xlsx" | "csv" | "json",
			queryVariables: Record<string, any>,
		) => {
			try {
				setDownloading(true);
				const pagination = await getPagination(refetch, {
					queryVariables: queryVariables,
					queryKey,
				});

				if (pagination) {
					const pageCount = Math.ceil(
						pagination.total! / pagination.pageSize!,
					);
					setPageCount(pageCount);
					const dataFetch = async (page: number) => {
						return await getData(refetch, {
							options: queryVariables,
							queryKey,
							resource,
							mapping,
							page,
							programMapping,
							regimenSetting,
						}).then((data) => {
							setProgress(page);

							show({
								type: {
									info: true,
								},
								message: `${i18n.t(
									"Downloading...",
								)} ${progress}/${pageCount}`,
							});
							return data;
						});
					};
					if (pageCount >= 1) {
						const data = flattenDeep(
							await mapSeries(
								range(1, pageCount + 1),
								asyncify(dataFetch),
							),
						);

						const groupedData = _.groupBy(data, "name");
						const mergedData = Object.keys(groupedData).map(
							(name) => {
								const dataArray: any = groupedData[name];

								const regimen =
									dataArray[0][
										programMapping.attributes?.regimen ?? ""
									];

								let adherenceFrequency;
								regimenSetting?.map((setting: any) => {
									if (setting.regimen === regimen) {
										adherenceFrequency =
											setting.administration as string;
									}
								});

								return {
									...dataArray[0],
									noOfSignal: dataArray.length,
									numberOfMissedDoses: dataArray.length,
									adherenceFrequency:
										adherenceFrequency ?? "Daily",
								};
							},
						);
						const finalData = mergedData.map((data) => {
							const percentage = !isEmpty(regimenSetting)
								? regimenSetting.map(
										(option: regimenSetting) => {
											if (
												option.administration ===
												data.adherenceFrequency
											) {
												return (
													(
														(data.noOfSignal /
															parseInt(
																option.idealDoses,
															)) *
														100
													).toFixed(2) + "%"
												);
											} else {
												return "N/A";
											}
										},
								  )
								: "N/A";

							const adherencePercentage =
								percentage != "N/A" ? percentage[0] : "N/A";
							return {
								...data,
								adherencePercentage: adherencePercentage,
							};
						});

						let i;
						reportConfigs.map(
							(report: ReportConfig, index: number) => {
								if (report.id === reportType) {
									i = index;
								}
							},
						);

						const { columns } =
							reportConfigs[parseInt(`${i ?? 0}`)];

						const keysToFilter = columns.map(
							(item: any) => item.key,
						);

						const sanitizedData = finalData.map((obj) =>
							Object.fromEntries(
								Object.entries(obj).filter(([key]) =>
									keysToFilter.includes(key),
								),
							),
						);

						await downloadFile(type, sanitizedData, report.name);
					}
				}
			} catch (e: any) {
				show({ message: e.message, type: { critical: true } });
				setTimeout(() => hide(), 5000);
			} finally {
				setDownloading(false);
				setProgress(0);
				setPageCount(0);
				hide();
			}
		},
		[hide, mapping, queryKey, refetch, resource, show],
	);

	return {
		download,
		downloading,
	};
}

export function downloadJSON(rows: any, reportName = "report"): void {
	const dataStr = JSON.stringify(rows);
	const dataUri =
		"data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
	const exportFileDefaultName = `${reportName}.json`;
	const linkElement = document.createElement("a");
	linkElement.setAttribute("href", dataUri);
	linkElement.setAttribute("download", exportFileDefaultName);
	linkElement.click();
}

export function downloadLineListingReport(
	format: string,
	rows: any[],
	reportName = "report",
): void {
	const workSheet = XLSX.utils.json_to_sheet(rows);
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, workSheet);
	XLSX.writeFile(workbook, `${reportName}.${format}`);
}
