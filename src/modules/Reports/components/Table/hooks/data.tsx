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
} from "../../../../shared/constants";
import { TrackedEntity } from "../../../../shared/types";
import { useSetting } from "@dhis2/app-service-datastore";
import { DateTime } from "luxon";
import { PeriodUtility } from "@hisptz/dhis2-utils";
import axios from "axios";
import { saveAs } from "file-saver";
import { useRecoilState } from "recoil";
import { SelectedReport } from "../FilterArea/components/FilterField";
import _ from "lodash";

// const query: any = {
// 	reports: {
// 		resource: "tracker/trackedEntities",
// 		params: ({
// 			page,
// 			pageSize,
// 			periods,
// 			startDate,
// 			endDate,
// 			program,
// 			orgUnit,
// 		}: {
// 			page: number;
// 			pageSize: number;
// 			filters?: string[];
// 			periods: string;
// 			startDate?: string;
// 			endDate?: string;
// 			program: string;
// 			orgUnit?: string;
// 		}) => ({
// 			pageSize,
// 			page,
// 			enrollmentEnrolledAfter: startDate,
// 			enrollmentEnrolledBefore: endDate,
// 			program,
// 			orgUnit,
// 			rootJunction: "OR",
// 			enrolledAt: periods,
// 			totalPages: true,
// 			ouMode: "DESCENDANTS",
// 			fields: TEI_FIELDS,
// 		}),
// 	},
// };

// function generateDimensions(dimensions: any) {
// 	const dimensionObj = {};
// 	dimensions.forEach((dimension: any) => {
// 		dimensionObj[`dimension ${dimension}`] = dimension;
// 	});
// 	return dimensionObj;
// }

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

export function useReportTableData() {
	const { filters } = useFilters();
	const [reports, setreports] = useState<[] | any>([]);
	const [programMapping] = useSetting("programMapping", {
		global: true,
	});
	const [regimenSetting] = useSetting("regimenSetting", {
		global: true,
	});
	const [pagination, setPagination] = useState<Pagination>();
	const [counter, setCounter] = useState<number>(1);
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

	const { data, loading, error, refetch } = useDataQuery<Data>(query, {
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
		refetch({
			page,
			pe: [period],
			ou: [orgUnit],
		});
	};
	const onPageSizeChange = (pageSize: number) => {
		refetch({
			page: 1,
			pageSize,
			pe: [period],
			ou: [orgUnit],
		});
	};

	function transformRowsData(headers: any, rows: any) {
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

	const rowData = transformRowsData(
		data?.reports.headers,
		data?.reports.rows,
	);

	const groupedData = _.groupBy(rowData, "tei");

	const mergedData = Object.keys(groupedData).map((tei) => {
		const dataArray = groupedData[tei];

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

	// let allData: any = [];

	// useEffect(() => {
	// 	if (data?.reports?.metaData?.pager?.page ?? 1 <= counter) {
	// 		refetch({
	// 			page: counter,
	// 			pe: [period],
	// 			ou: [orgUnit],
	// 		});
	// 		setCounter((prevState) => {
	// 			return prevState++;
	// 		});
	// 		allData.push(data?.reports);
	// 	}
	// }, [counter]);

	// console.log(allData);

	useEffect(() => {
		if (data) {
			setreports(
				mergedData.map((data) => {
					return data;
				}) ?? [],
			);
			setPagination({
				page: data?.reports.metaData.pager.page,
				pageSize: data?.reports.metaData.pager.pageSize,
				total: data?.reports.metaData.pager.total,
				pageCount: data?.reports.metaData.pager.pageCount,
			});
		}
	}, [data]);

	const { download, downloading } = useDownloadData({
		resource: "analytics/events",
		query: query,
		queryKey: "reports",
		mapping: (data: TrackedEntity) => {
			const downloadData = new PatientProfile(
				data,
				programMapping,
				regimenSetting,
			).tableData;

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
	};
}

export const useDATDevices = () => {
	const [programMapping] = useSetting("programMapping", { global: true });
	const [report] = useRecoilState<ReportConfig>(SelectedReport);
	const [data, setData] = useState<any>();
	const [errorDevice, setError] = useState<any>();
	const [loadingDevice, setLoading] = useState(true);
	const MediatorUrl = programMapping.mediatorUrl;
	const ApiKey = programMapping.apiKey;
	const [downloadingDAT, setDownloading] = useState(false);

	const { show, hide } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 1500 }),
	);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axios.get(
					`${MediatorUrl}/api/devices/`,
					{
						headers: {
							"x-api-key": ApiKey,
						},
					},
				);
				setData(response.data);

				setLoading(false);
			} catch (error) {
				setError(error);

				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const downloadFile = async (type: "xlsx" | "json" | "csv") => {
		setDownloading(true);
		try {
			if (type === "json") {
				saveAs(
					new File(
						[JSON.stringify(data.devices)] as any,
						"data.json",
						{
							type: "json",
						},
					),
					`${report.name}.json`,
				);
			} else if (type === "xlsx") {
				const excel = await import("xlsx");
				const workbook = excel.utils.book_new();
				const worksheet = excel.utils.json_to_sheet(data.devices);
				excel.utils.book_append_sheet(workbook, worksheet, "data");
				excel.writeFile(workbook, `${report.name}.xlsx`);
			} else if (type === "csv") {
				const excel = await import("xlsx");
				const worksheet = excel.utils.json_to_sheet(data.devices);
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
		data,
		errorDevice,
		loadingDevice,
		downloadFile,
		downloadingDAT,
	};
};
