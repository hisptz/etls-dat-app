import { useAlert, useDataQuery } from "@dhis2/app-runtime";
import { useEffect, useState } from "react";
import { Pagination } from "@hisptz/dhis2-utils";
import { useSearchParams } from "react-router-dom";
import i18n from "@dhis2/d2-i18n";
import { compact, isEmpty } from "lodash";
import { useDownloadData } from "../../../utils/download";
import { PatientProfile } from "../../../../shared/models";
import {
	DATA_ELEMENTS,
	DAT_PROGRAM,
	ReportConfig,
	TEI_FIELDS,
	programMapping,
	regimenSetting,
} from "../../../../shared/constants";
import { TrackedEntity } from "../../../../shared/types";
import { useSetting } from "@dhis2/app-service-datastore";
import { DateTime } from "luxon";
import { PeriodUtility } from "@hisptz/dhis2-utils";
import axios from "axios";
import { saveAs } from "file-saver";
import { atom, useRecoilState } from "recoil";
import { SelectedReport } from "../FilterArea/components/FilterField";
import _ from "lodash";
import { CustomDataTableRow } from "@hisptz/dhis2-ui";

const query: any = {
	reports: {
		resource: "analytics/events",
		id: ({ program }: any) => `query/${program}`,
		params: ({
			page,
			pageSize,
			pe,
			stage,
			dx,
			ou,
		}: {
			page: number;
			pageSize: number;
			filters?: string[];
			pe: string[];
			startDate?: string;
			endDate?: string;
			dx: [];
			stage: string;
			ou: string[];
		}) => ({
			dimension: [
				`ou:${ou.join(";")}`,
				`pe:${pe.join(";")}`,
				...(dx?.map((dx: string) => `${dx}`) ?? []),
			],
			stage,
			displayProperty: "NAME",
			outputType: "EVENT",
			desc: "eventdate",
			pageSize,
			page,
			totalPages: true,
		}),
	},
};
type Data = {
	reports: {
		headers: [];
		metaData: {
			dimensions: object;
			items: object;
			pager: {
				page: number;
				pageCount: number;
				pageSize: number;
				total: number;
			};
		};
		rows: [];
	};
};

export const allRowData = atom<[]>({
	key: "all-row-data-state",
	default: [],
});

export function filterObject(programMapping: programMapping) {
	const filtersConfig: any = {
		patientNumber: {
			attribute: programMapping.attributes?.patientNumber,
			operator: "eq",
		},
		deviceIMEInumber: {
			attribute: programMapping.attributes?.deviceIMEInumber,
			operator: "eq",
		},
	};

	return { filtersConfig: filtersConfig };
}

export function useFilters() {
	const [params] = useSearchParams();
	const [programMapping] = useSetting("programMapping", {
		global: true,
	});

	const filters = compact(
		Array.from(params.keys()).map((filter) => {
			const filterConfig =
				filterObject(programMapping).filtersConfig[filter];
			if (filterConfig) {
				const value = params.get(filter);
				if (value) {
					return `${filterConfig.attribute}:${filterConfig.operator}:${value}`;
				}
			}
		}),
	);

	return {
		filters,
		startDate: params.get("startDate"),
		endDate: params.get("endDate"),
	};
}

export function transformRowsData(headers: any, rows: any) {
	if (!headers || !rows || rows.length === 0) {
		return [];
	}
	const transformedData = [];

	for (const row of rows) {
		const rowData = {};

		headers.forEach((header: any, index: number) => {
			const columnId = header.name;
			const cellValue = row[index];

			rowData[columnId] = cellValue;
		});

		transformedData.push(rowData);
	}

	return transformedData;
}

export function useReportTableData() {
	const [reports, setreports] = useState<[] | any>([]);
	const [programMapping] = useSetting("programMapping", {
		global: true,
	});
	const [regimenSetting] = useSetting("regimenSetting", {
		global: true,
	});
	const [pagination, setPagination] = useState<Pagination>();

	const [allData, setAllData] = useState<[] | any>();
	const [paginatedEvents, setPaginatedEvents] = useState<{
		page: any;
		pageSize: any;
		total: any;
		pageCount: number;
		data: any;
	}>();

	const [currentPage, setCurrentPage] = useState<number>(1);
	const [currentPageSize, setPageSize] = useState<number>(50);

	const [params] = useSearchParams();
	const orgUnit = params.get("ou");
	const period = params.get("periods");
	const reportType = params.get("reportType");
	const [reportConfigs] = useSetting("reports", { global: true });

	const stage = programMapping.programStage;

	const dimensions = [
		stage + "." + programMapping.attributes.patientNumber,
		stage + "." + programMapping.attributes.firstName,
		stage + "." + programMapping.attributes.surname,
		stage + "." + programMapping.attributes.phoneNumber,
		stage + "." + programMapping.attributes.regimen,
		stage +
			"." +
			DATA_ELEMENTS.DEVICE_SIGNAL +
			(reportType === "tb-adherence-report"
				? ":IN:Once;Multiple"
				: reportType === "patients-who-missed-doses"
				? ":IN:Heartbeat;None"
				: ""),
	];

	function paginateEvent(
		eventArray: any,
		currentPage: number,
		pageSize: number,
	) {
		const startIndex = (currentPage - 1) * pageSize;
		const endIndex = startIndex + pageSize;

		const pageData = eventArray.slice(startIndex, endIndex);

		const pagination = {
			page: currentPage,
			pageSize: pageSize,
			total: eventArray.length,
			pageCount: Math.ceil(eventArray.length / pageSize),
			data: pageData,
		};

		return pagination;
	}

	const { data, error, refetch, loading } = useDataQuery<Data>(query, {
		variables: {
			page: 1,
			pageSize: 50,
			program: DAT_PROGRAM(),
			stage,
			pe: [period],
			ou: [orgUnit],
			dx: dimensions,
		},
		lazy: true,
	});

	const onPageChange = (page: number) => {
		setCurrentPage(page);
		const result = paginateEvent(mergedData, page, currentPageSize);
		setPaginatedEvents(result);
	};
	const onPageSizeChange = (pageSize: number) => {
		setPageSize(pageSize);
		const result = paginateEvent(mergedData, 1, pageSize);
		setPaginatedEvents(result);
	};

	const getAllEvents = async () => {
		try {
			const result = await refetch({
				page: 1,
				pe: [period],
				ou: [orgUnit],
				dx: dimensions,
			});

			const count = result.reports?.metaData.pager.pageCount;

			if (count) {
				const promises = [];

				for (let i = 0; i < count; i++) {
					try {
						const data = await refetch({
							page: i + 1,
							pe: [period],
							ou: [orgUnit],
							dx: dimensions,
						});

						if (data) {
							promises.push(
								transformRowsData(
									data.reports?.headers,
									data.reports?.rows,
								),
							);
						} else {
							promises.push(null);
						}
					} catch (error) {
						console.error(
							`Error fetching data for page ${i + 1}:`,
							error,
						);
						promises.push(null);
					}
				}

				const RowsData = await Promise.all(promises);

				const flattenedData = _.flatten(RowsData);

				setAllData(flattenedData);
			}
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};

	const groupedData = _.groupBy(allData, "tei");

	const mergedData = Object.keys(groupedData).map((tei) => {
		const dataArray: any = groupedData[tei];

		const regimen = dataArray[0][programMapping.attributes.regimen];

		let adherenceFrequency;
		regimenSetting?.map((setting: any) => {
			if (setting.regimen === regimen) {
				adherenceFrequency = setting.administration as string;
			}
		});

		return {
			...dataArray[0],
			noOfSignal: dataArray.length,
			adherenceFrequency: adherenceFrequency ?? "Daily",
		};
	});
	useEffect(() => {
		if (mergedData) {
			const results = paginateEvent(mergedData, 1, 50);
			setPaginatedEvents(results);
		}
	}, [allData]);

	useEffect(() => {
		if (paginatedEvents) {
			setreports(
				paginatedEvents.data.map((data: any) => {
					return data;
				}),
			);

			setPagination({
				page: paginatedEvents.page,
				pageSize: paginatedEvents.pageSize,
				total: paginatedEvents.total,
				pageCount: paginatedEvents.pageCount,
			});
		}
	}, [paginatedEvents]);

	const { download, downloading } = useDownloadData({
		resource: "analytics/events",
		query: query,
		queryKey: "reports",
		mapping: (data: any) => {
			const downloadData = data;

			let i;
			reportConfigs.map((report: ReportConfig, index: number) => {
				if (report.id === reportType) {
					i = index;
				}
			});

			const { columns } = reportConfigs[parseInt(`${i ?? 0}`)];

			return Object.fromEntries(
				Object.entries(downloadData).filter(([key]) =>
					columns.map(({ key }: any) => key).includes(key),
				),
			);
		},
	});

	const programId = DAT_PROGRAM();

	const onDownload = (type: "xlsx" | "csv" | "json") => {
		if (!isEmpty(orgUnit) && !isEmpty(period)) {
			download(type, {
				pe: [period],
				ou: [orgUnit],
				dx: dimensions,
				pageSize: 500,
				program: programId,
			});
		}
	};

	return {
		pagination: {
			...pagination,
			onPageSizeChange,
			onPageChange,
		},
		reports,
		downloading,
		download: onDownload,
		loading,
		error,
		refetch,
		getAllEvents,
	};
}

export const useDATDevices = () => {
	const [programMapping] = useSetting("programMapping", { global: true });
	const [report] = useRecoilState<ReportConfig>(SelectedReport);
	const [data, setData] = useState<any>();
	const [allDevices, setAllDevices] = useState<any>();
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [currentPageSize, setPageSize] = useState<number>(20);
	const [errorDevice, setError] = useState<any>();
	const [loadingDevice, setLoading] = useState(true);
	const [pagination, setPagination] = useState<Pagination>();
	const MediatorUrl = programMapping.mediatorUrl;
	const ApiKey = programMapping.apiKey;
	const [downloadingDAT, setDownloading] = useState(false);

	const { show, hide } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 5000 }),
	);

	async function paginateArray(
		eventArray: any,
		currentPage: number,
		pageSize: number,
	) {
		const startIndex = (currentPage - 1) * pageSize;
		const endIndex = startIndex + pageSize;

		const pageData = eventArray.slice(startIndex, endIndex);

		const pagination = {
			page: currentPage,
			pageSize: pageSize,
			total: eventArray.length,
			pageCount: Math.ceil(eventArray.length / pageSize),
			data: pageData,
		};

		return pagination;
	}

	const fetchData = async () => {
		try {
			const response = await axios.get(`${MediatorUrl}/api/devices/`, {
				headers: {
					"x-api-key": ApiKey,
				},
			});

			setAllDevices(response.data?.devices ?? []);

			setLoading(false);
		} catch (error) {
			setError(error);
			setLoading(false);
		}
	};

	const paginateData = async ({
		page,
		pageSize,
	}: {
		page?: number;
		pageSize?: number;
	}) => {
		try {
			const paginatedData = await paginateArray(
				allDevices ?? [],
				page ?? currentPage,
				pageSize ?? currentPageSize,
			);

			const defaultData = await paginateArray(
				allDevices ?? [],
				1,
				pageSize ?? currentPageSize,
			);

			setData(
				!isEmpty(paginatedData.data)
					? paginatedData.data
					: defaultData.data,
			);
			setPagination({
				page: !isEmpty(paginatedData.data)
					? paginatedData.page
					: defaultData.page,
				pageSize: !isEmpty(paginatedData.data)
					? paginatedData.pageSize
					: defaultData.pageSize,
				total: !isEmpty(paginatedData.data)
					? paginatedData.total
					: defaultData.total,
				pageCount: !isEmpty(paginatedData.data)
					? paginatedData.pageCount
					: defaultData.pageCount,
			});

			setLoading(false);
		} catch (error) {
			setError(error);
			setLoading(false);
		}
	};

	useEffect(() => {
		paginateData({});
	}, [allDevices]);

	useEffect(() => {
		fetchData();
	}, []);

	const onPageChange = async (page: number) => {
		setCurrentPage(page);
		await paginateData({ page: page });
	};
	const onPageSizeChange = async (pageSize: number) => {
		setPageSize(pageSize);
		await paginateData({ pageSize: pageSize });
	};

	const downloadFile = async (type: "xlsx" | "json" | "csv") => {
		setDownloading(true);
		try {
			if (type === "json") {
				saveAs(
					new File([JSON.stringify(allDevices)] as any, "data.json", {
						type: "json",
					}),
					`${report.name}.json`,
				);
			} else if (type === "xlsx") {
				const excel = await import("xlsx");
				const workbook = excel.utils.book_new();
				const worksheet = excel.utils.json_to_sheet(allDevices);
				excel.utils.book_append_sheet(workbook, worksheet, "data");
				excel.writeFile(workbook, `${report.name}.xlsx`);
			} else if (type === "csv") {
				const excel = await import("xlsx");
				const worksheet = excel.utils.json_to_sheet(allDevices);
				const csvData = excel.utils.sheet_to_csv(worksheet);
				saveAs(
					new File([csvData], "data.csv", {
						type: "csv",
					}),
					`${report.name}.csv`,
				);
			}
			show({
				type: {
					info: true,
				},
				message: `${i18n.t("Downloading...")}`,
			});
		} catch (e: any) {
			show({ message: e.message, type: { critical: true } });
			setTimeout(() => hide(), 5000);
		} finally {
			setDownloading(false);
			hide();
		}
	};

	return {
		paginationDAT: {
			...pagination,
			onPageSizeChange,
			onPageChange,
		},
		data,
		errorDevice,
		loadingDevice,
		downloadFile,
		downloadingDAT,
	};
};

export function sanitizeReportData(
	data: any[],
	regimenSettings: regimenSetting[],
	programMapping: programMapping,
) {
	return data.map((report: any) => {
		const percentage = !isEmpty(regimenSettings)
			? regimenSettings.map((option: regimenSetting) => {
					if (option.administration === report.adherenceFrequency) {
						return (
							(
								(report.noOfSignal /
									parseInt(option.idealDoses)) *
								100
							).toFixed(2) + "%"
						);
					} else {
						return "N/A";
					}
			  })
			: "N/A";

		const adherencePercentage = percentage != "N/A" ? percentage[0] : "N/A";
		return {
			...([] as unknown as CustomDataTableRow),
			tbIdentificationNumber:
				report[programMapping.attributes?.patientNumber ?? ""],
			name:
				report[programMapping.attributes?.firstName ?? ""] +
				" " +
				report[programMapping.attributes?.surname ?? ""],
			phoneNumber: report[programMapping.attributes?.phoneNumber ?? ""],
			adherenceFrequency: report.adherenceFrequency,
			adherencePercentage: adherencePercentage,
			numberOfMissedDoses: report.noOfSignal,
			deviceIMEINumber: report.imei,
			daysInUse: report.daysDeviceInUse,
			lastHeartbeat: report.lastHeartBeat,
			lastOpened: report.lastOpened,
			lastBatteryLevel: report.batteryLevel,
		};
	});
}
