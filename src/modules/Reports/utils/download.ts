import * as XLSX from "xlsx";
import i18n from "@dhis2/d2-i18n";
import { asyncify, mapSeries } from "async-es";
import { useAlert, useDataQuery } from "@dhis2/app-runtime";
import { useCallback, useEffect, useState } from "react";
import { Pagination } from "@hisptz/dhis2-utils";
import { flattenDeep, get, isEmpty, range } from "lodash";
import { saveAs } from "file-saver";

export async function downloadFile(
	type: "xlsx" | "json" | "csv",
	data: any[],
	options?: { filename?: string },
) {
	if (type === "json") {
		saveAs(
			new File([JSON.stringify(data)] as any, "data.json", {
				type: "json",
			}),
			`${options?.filename ?? "data"}.json`,
		);
	} else if (type === "xlsx") {
		const excel = await import("xlsx");
		const workbook = excel.utils.book_new();
		const worksheet = excel.utils.json_to_sheet(data);
		excel.utils.book_append_sheet(workbook, worksheet, "data");
		excel.writeFile(workbook, `${options?.filename ?? "data"}.xlsx`);
	} else if (type === "csv") {
		const excel = await import("xlsx");
		const worksheet = excel.utils.json_to_sheet(data);
		const csvData = excel.utils.sheet_to_csv(worksheet);
		saveAs(
			new File([csvData], "data.csv", {
				type: "csv",
			}),
			`${options?.filename ?? "data"}.csv`,
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
		page: get(data, [queryKey, "page"]),
		total: get(data, [queryKey, "total"]),
		pageSize: get(data, [queryKey, "pageSize"]),
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
	}: {
		options: any;
		queryKey: string;
		resource: string;
		mapping: any;
		page: number;
	},
): Promise<Array<Record<string, any>>> {
	const data = await refetch({ ...options, page });
	const rawData = get(data, [queryKey, "instances"]);
	if (!isEmpty(rawData)) {
		return rawData.map(mapping);
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
		({ type }) => ({ ...type, duration: 10000 }),
	);

	const [downloading, setDownloading] = useState(false);
	const [pageCount, setPageCount] = useState(0);
	const [progress, setProgress] = useState(0);

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
						await downloadFile(type, data);
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
