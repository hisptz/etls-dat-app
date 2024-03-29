import { useDataQuery } from "@dhis2/app-runtime";
import { useCallback, useEffect, useState } from "react";
import { Pagination } from "@hisptz/dhis2-utils";
import { useSearchParams } from "react-router-dom";
import { head, isEmpty } from "lodash";
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
import BatteryLevel from "../../../../shared/components/BatteryLevel/BatteryLevel";
import React from "react";
import { DateTime } from "luxon";
import AdherenceStreak from "../../../../shared/components/AdherenceStreak/AdherenceStreak";
import { GetAdherenceStreakForReport } from "./adherenceStreak";

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
		stage + "." + programMapping?.attributes?.patientNumber,
		stage + "." + programMapping?.attributes?.firstName,
		stage + "." + programMapping?.attributes?.surname,
		stage + "." + programMapping?.attributes?.phoneNumber,
		stage + "." + programMapping?.attributes?.regimen,
		stage + "." + programMapping?.attributes?.deviceIMEInumber,
		stage + "." + DATA_ELEMENTS.DOSAGE_TIME,
		stage +
			"." +
			DATA_ELEMENTS.DEVICE_SIGNAL +
			(reportType === "tb-adherence-report"
				? ""
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
			pageSize: 100,
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
		setAllData([]);
		try {
			const result = (await refetch({
				page: 1,
				program: programMapping?.program ?? "",
				stage,
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

	const getAdherenceData = () => {
		const transformedData: any = {};

		_.forEach(groupedData, (dataArray, key) => {
			transformedData[key] = _.map(dataArray, (item) => {
				const signal = _.get(
					item,
					stage + "." + DATA_ELEMENTS.DEVICE_SIGNAL,
					"",
				);
				const event =
					signal == "Once"
						? "takenDose"
						: signal == "Multiple"
						? "takenDose"
						: signal == "Heartbeat"
						? "notTakenDose"
						: signal == "None"
						? ""
						: "";

				const date = !isEmpty(
					_.get(item, stage + "." + DATA_ELEMENTS.DOSAGE_TIME, ""),
				)
					? _.get(item, stage + "." + DATA_ELEMENTS.DOSAGE_TIME, "")
					: _.get(item, "eventdate", "");

				return { event, date };
			});
		});

		return transformedData;
	};

	const adherenceStreakData = getAdherenceData();

	const filterData = (
		data: any,
		propertyName: string,
		filterValues: string[],
	) => {
		for (const key in data) {
			// eslint-disable-next-line no-prototype-builtins
			if (data.hasOwnProperty(key) && Array.isArray(data[key])) {
				data[key] = data[key].filter((obj: any) =>
					filterValues.includes(obj[propertyName]),
				);
				if (data[key].length === 0) {
					delete data[key];
				}
			}
		}

		return data;
	};

	const filteredGroupedData = filterData(
		{ ...groupedData },
		stage + "." + DATA_ELEMENTS.DEVICE_SIGNAL,
		["Once", "Multiple"],
	);

	const mergedData = Object.keys(
		reportType === "tb-adherence-report"
			? filteredGroupedData
			: groupedData,
	).map((tei) => {
		const dataArray: any =
			reportType === "tb-adherence-report"
				? filteredGroupedData[tei]
				: groupedData[tei];

		const allDataArray: any = groupedData[tei];
		const regimen =
			dataArray[0][
				stage + "." + programMapping?.attributes?.regimen ?? ""
			];

		let adherenceFrequency;
		regimenSetting?.map((setting: any) => {
			if (setting.regimen === regimen) {
				adherenceFrequency = setting.administration as string;
			}
		});

		return {
			...dataArray[0],
			noOfSignal: dataArray.length,
			allEvents: isEmpty(allDataArray) ? 1 : allDataArray.length,
			regimen: regimen,
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
		adherenceStreakData,
	};
}

export const useDATDevices = () => {
	const [programMapping] = useSetting("programMapping", { global: true });
	const [data, setData] = useState<any>();
	const [allDevices, setAllDevices] = useRecoilState<any[]>(
		DATDevicesReportState,
	);
	const [params] = useSearchParams();
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [currentPageSize, setPageSize] = useState<number>(20);
	const [errorDevice, setError] = useState<any>();
	const [loadingDevice, setLoading] = useState(true);
	const [pagination, setPagination] = useState<Pagination>();
	const currentProgram = params.get("program");
	const mapping = getProgramMapping(programMapping, currentProgram);
	const MediatorUrl = mapping?.mediatorUrl;
	const ApiKey = mapping?.apiKey;
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

	const fetchData = useCallback(async () => {
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
	}, []);

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
		if (!isEmpty(programMapping)) {
			fetchData();
		}
	}, []);

	const refetch = useCallback(async () => {
		setLoading(true);
		await fetchData();
	}, [fetchData]);

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
		refetch,
	};
};

export function sanitizeReportData(
	data: any[],
	regimenSettings: RegimenSetting[],
	programMapping: ProgramMapping,
	downloadable: boolean,
	deviceList?: any[],
	adherenceStreakData?: any,
) {
	return data.map((report: any) => {
		const eventData = adherenceStreakData
			? adherenceStreakData[report.tei]
			: [];

		const groupDataByWeeks = () => {
			const groupedData: any = {};
			eventData?.forEach((item: any) => {
				const occurredDate = new Date(item.date);
				const weekStartDate = new Date(
					occurredDate.getFullYear(),
					occurredDate.getMonth(),
					occurredDate.getDate() - occurredDate.getDay(),
				);
				const weekEndDate = new Date(
					weekStartDate.getFullYear(),
					weekStartDate.getMonth(),
					weekStartDate.getDate() + 6,
				);
				const week = `${weekStartDate.toLocaleDateString()} - ${weekEndDate.toLocaleDateString()}`;
				if (!groupedData[week]) {
					groupedData[week] = [];
				}
				groupedData[week].push(item);
			});
			return groupedData;
		};

		const groupDataByMonths = () => {
			const groupedData: any = {};
			eventData?.forEach((item: any) => {
				const occurredDate = new Date(item.date);
				const year = occurredDate.getFullYear();
				const month = occurredDate.getMonth();
				const monthStartDate = new Date(year, month, 1);
				const monthEndDate = new Date(year, month + 1, 0);
				const monthKey = `${monthStartDate.toLocaleDateString()} - ${monthEndDate.toLocaleDateString()}`;
				if (!groupedData[monthKey]) {
					groupedData[monthKey] = [];
				}
				groupedData[monthKey].push(item);
			});
			return groupedData;
		};

		const groupedData =
			report.adherenceFrequency == "Weekly"
				? groupDataByWeeks()
				: report.adherenceFrequency == "Monthly"
				? groupDataByMonths()
				: {};

		const priortizeData = (dataArray: any) => {
			for (const key in dataArray) {
				const objects = dataArray[key];
				let found = false;
				for (let i = 0; i < objects.length; i++) {
					if (objects[i].event === "takenDose") {
						found = true;
						break;
					}
				}
				if (found) {
					dataArray[key] = objects.filter(
						(obj: any) => obj.event === "takenDose",
					);
				}
			}
			return dataArray;
		};

		const transformData = (dataArray: any) => {
			const resultArray = [];
			for (const key in dataArray) {
				if (dataArray[key].length > 0) {
					resultArray.push(dataArray[key][0]);
				}
			}
			return resultArray;
		};

		const events =
			report.adherenceFrequency == "Daily"
				? eventData
				: transformData(priortizeData(groupedData));

		const takenDose = events?.filter(
			(event: any) => event.event === "takenDose",
		).length;

		const newPercentage =
			((takenDose / events?.length) * 100).toFixed(2) + "%";

		const lastOpened = DateTime.fromFormat(
			report.lastOpened ?? "",
			"yyyy-MM-dd HH:mm:ss",
		).toFormat("dd/LL/yyyy");
		const lastHeartBeat = DateTime.fromFormat(
			report.lastHeartBeat ?? "",
			"yyyy-MM-dd HH:mm:ss",
		).toFormat("dd/LL/yyyy");

		const treatmentStart = DateTime.fromFormat(
			report.enrollmentdate ?? "",
			"yyyy-MM-dd HH:mm:ss.s",
		).toFormat("dd/LL/yyyy");

		const deviceIMEI =
			report[
				programMapping.programStage +
					"." +
					programMapping.attributes?.deviceIMEInumber ?? ""
			];

		const batteryLevel = head(
			deviceList
				?.filter((device) => deviceIMEI === device.imei)
				.map((device) => device.batteryLevel),
		);

		return {
			...([] as unknown as CustomDataTableRow),
			treatmentStart: treatmentStart,
			patientNumber:
				report[
					programMapping.programStage +
						"." +
						programMapping.attributes?.patientNumber ?? ""
				],
			name:
				report[
					programMapping.programStage +
						"." +
						programMapping.attributes?.firstName ?? ""
				] +
				" " +
				report[
					programMapping.programStage +
						"." +
						programMapping.attributes?.surname ?? ""
				],
			phoneNumber:
				report[
					programMapping.programStage +
						"." +
						programMapping.attributes?.phoneNumber ?? ""
				],
			adherenceFrequency: report.adherenceFrequency,
			adherencePercentage: newPercentage,
			adherenceStreak: downloadable ? (
				report.adherenceFrequency
			) : (
				<GetAdherenceStreakForReport
					device={deviceIMEI}
					events={eventData ?? []}
					frequency={report.adherenceFrequency}
				/>
			),
			numberOfMissedDoses: report.noOfSignal,
			orgUnit: report.ouname,
			deviceIMEI: deviceIMEI,
			battery: downloadable ? (
				(batteryLevel ?? "N/A").toString()
			) : (
				<BatteryLevel device={deviceIMEI} />
			),
			deviceIMEINumber: report.imei,
			daysInUse: report.daysDeviceInUse,
			lastHeartbeat: lastHeartBeat,
			lastOpened: lastOpened,
			lastBatteryLevel: downloadable ? (
				report.batteryLevel
			) : (
				<BatteryLevel batteryLevel={report.batteryLevel} />
			),
		};
	});
}
