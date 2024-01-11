import { useDataQuery } from "@dhis2/app-runtime";
import { useEffect, useState } from "react";
import { Pagination } from "@hisptz/dhis2-utils";
import { useSearchParams } from "react-router-dom";
import { isEmpty } from "lodash";
import {
	DATA_ELEMENTS,
	ProgramMapping,
	RegimenSetting,
} from "../../../../shared/constants";
import { useSetting } from "@dhis2/app-service-datastore";
import axios from "axios";
import { atom, useRecoilState } from "recoil";
import _ from "lodash";
import { CustomDataTableRow } from "@hisptz/dhis2-ui";
import { DATDevicesReportState, DHIS2ReportState } from "../../../state/report";
import { getProgramMapping } from "../../../../shared/utils";

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

type CustomPagination = {
	page: any;
	pageSize: any;
	total: any;
	pageCount: number;
	data: any;
};

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

export const allRowData = atom<[]>({
	key: "all-row-data-state",
	default: [],
});

export function transformRowsData(headers: any, rows: any) {
	if (!headers || !rows || rows.length === 0) {
		return [];
	}
	const transformedData = [];

	for (const row of rows) {
		const rowData: any = {};

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
	const [reports, setReports] = useState<[] | any>([]);
	const [programMappings] = useSetting("programMapping", {
		global: true,
	});
	const [regimenSetting] = useSetting("regimenSetting", {
		global: true,
	});
	const [pagination, setPagination] = useState<Pagination>();

	const [allData, setAllData] = useState<any[]>();
	const [, setDHIS2ReportData] = useRecoilState<any[]>(DHIS2ReportState);
	const [paginatedEvents, setPaginatedEvents] = useState<CustomPagination>();

	const [, setCurrentPage] = useState<number>(1);
	const [currentPageSize, setPageSize] = useState<number>(50);
	const [params] = useSearchParams();
	const orgUnit = params.get("ou");
	const program = params.get("program");
	const period = params.get("periods");
	const reportType = params.get("reportType");

	const programMapping = getProgramMapping(
		programMappings,
		program,
	) as ProgramMapping;
	const stage = programMapping?.programStage ?? "";

	const dimensions = [
		stage + "." + programMapping.attributes?.patientNumber,
		stage + "." + programMapping.attributes?.firstName,
		stage + "." + programMapping.attributes?.surname,
		stage + "." + programMapping.attributes?.phoneNumber,
		stage + "." + programMapping.attributes?.regimen,
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

		return {
			page: currentPage,
			pageSize: pageSize,
			total: eventArray.length,
			pageCount: Math.ceil(eventArray.length / pageSize),
			data: pageData,
		};
	}

	const { error, refetch, loading } = useDataQuery<Data>(query, {
		variables: {
			page: 1,
			pageSize: 50,
			program: programMapping?.program ?? "",
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
			const result = (await refetch({
				page: 1,
				pe: [period],
				ou: [orgUnit],
				dx: dimensions,
			})) as any;

			const count = result.reports?.metaData.pager.pageCount;

			if (count) {
				const promises = [];

				for (let i = 0; i < count; i++) {
					try {
						const data = (await refetch({
							page: i + 1,
							pe: [period],
							ou: [orgUnit],
							dx: dimensions,
						})) as any;

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
		const regimen = dataArray[0][programMapping?.attributes?.regimen ?? ""];

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
			setDHIS2ReportData(mergedData);
		}
	}, [allData]);

	useEffect(() => {
		if (paginatedEvents) {
			setReports(
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

	return {
		pagination: {
			...pagination,
			onPageSizeChange,
			onPageChange,
		},
		reports,
		loading,
		error,
		refetch,
		getAllEvents,
	};
}

export const useDATDevices = () => {
	const [programMapping] = useSetting("programMapping", { global: true });
	const [data, setData] = useState<any>();
	const [allDevices, setAllDevices] = useRecoilState<any[]>(
		DATDevicesReportState,
	);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [currentPageSize, setPageSize] = useState<number>(20);
	const [errorDevice, setError] = useState<any>();
	const [loadingDevice, setLoading] = useState(true);
	const [pagination, setPagination] = useState<Pagination>();
	const MediatorUrl = programMapping.mediatorUrl;
	const ApiKey = programMapping.apiKey;
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

	return {
		paginationDAT: {
			...pagination,
			onPageSizeChange,
			onPageChange,
		},
		data,
		errorDevice,
		loadingDevice,
	};
};

export function sanitizeReportData(
	data: any[],
	regimenSettings: RegimenSetting[],
	programMapping: ProgramMapping,
) {
	return data.map((report: any) => {
		const percentage = !isEmpty(regimenSettings)
			? regimenSettings.map((option: RegimenSetting) => {
					if (option.administration === report.adherenceFrequency) {
						return (
							(
								(report.noOfSignal /
									parseInt(option.numberOfDoses)) *
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
