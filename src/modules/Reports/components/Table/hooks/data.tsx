import { useAlert, useDataQuery } from "@dhis2/app-runtime";
import { useEffect, useState } from "react";
import { Pagination } from "@hisptz/dhis2-utils";
import { useSearchParams } from "react-router-dom";
import i18n from "@dhis2/d2-i18n";
import { compact, isEmpty } from "lodash";
import { useDownloadData } from "../../../utils/download";
import { PatientProfile } from "../../../../shared/models";
import {
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

const query: any = {
	reports: {
		resource: "tracker/trackedEntities",
		params: ({
			page,
			pageSize,
			periods,
			startDate,
			endDate,
			program,
			orgUnit,
		}: {
			page: number;
			pageSize: number;
			filters?: string[];
			periods: string;
			startDate?: string;
			endDate?: string;
			program: string;
			orgUnit?: string;
		}) => ({
			pageSize,
			page,
			enrollmentEnrolledAfter: startDate,
			enrollmentEnrolledBefore: endDate,
			program,
			orgUnit,
			rootJunction: "OR",
			enrolledAt: periods,
			totalPages: true,
			ouMode: "DESCENDANTS",
			fields: TEI_FIELDS,
		}),
	},
};

type Data = {
	reports: {
		instances: TrackedEntity[];
		page: number;
		pageSize: number;
		total: number;
	};
};
export function filterObject(programMapping: programMapping) {
	const filtersConfig: any = {
		tbDistrictNumber: {
			attribute: programMapping.attributes?.tbDistrictNumber,
			operator: "eq",
		},
		deviceEMInumber: {
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
	const [reports, setreports] = useState<PatientProfile[] | []>([]);
	const [programMapping] = useSetting("programMapping", {
		global: true,
	});
	const [regimenSetting] = useSetting("regimenSetting", {
		global: true,
	});
	const [pagination, setPagination] = useState<Pagination>();
	const [params] = useSearchParams();
	const orgUnit = params.get("ou");
	const period = params.get("periods");
	const reportType = params.get("reportType");
	const [reportConfigs] = useSetting("reports", { global: true });

	const periods = PeriodUtility.getPeriodById(
		!isEmpty(period) ? period : "TODAY",
	);
	const s = DateTime.fromISO(periods.start);
	const startDate = s.toFormat("yyyy-MM-dd");
	const e = DateTime.fromISO(periods.end);
	const endDate = e.toFormat("yyyy-MM-dd");

	const { data, loading, error, refetch } = useDataQuery<Data>(query, {
		variables: {
			page: 1,
			pageSize: 20,
			program: DAT_PROGRAM(),
			startDate,
			endDate,
			filters,
			orgUnit,
		},
		lazy: true,
	});

	const onPageChange = (page: number) => {
		refetch({
			page,
			filters,
			orgUnit,
		});
	};
	const onPageSizeChange = (pageSize: number) => {
		refetch({
			page: 1,
			pageSize,
			filters,
			orgUnit,
		});
	};

	useEffect(() => {
		if (data) {
			setreports(
				data?.reports.instances.map((tei) => {
					return new PatientProfile(
						tei,
						programMapping,
						regimenSetting,
					);
				}) ?? [],
			);
			setPagination({
				page: data?.reports.page,
				pageSize: data?.reports.pageSize,
				total: data?.reports.total,
				pageCount: Math.ceil(
					data?.reports.total / data?.reports.pageSize,
				),
			});
		}
	}, [data]);

	const { download, downloading } = useDownloadData({
		resource: "tracker/trackedEntities",
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
		if (!isEmpty(orgUnit) && !isEmpty(startDate)) {
			download(type, {
				orgUnit,
				filters,
				startDate,
				endDate,
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
					"DAT Device Summary Report.json",
				);
			} else if (type === "xlsx") {
				const excel = await import("xlsx");
				const workbook = excel.utils.book_new();
				const worksheet = excel.utils.json_to_sheet(data.devices);
				excel.utils.book_append_sheet(workbook, worksheet, "data");
				excel.writeFile(workbook, "DAT Device Summary Report.xlsx");
			} else if (type === "csv") {
				const excel = await import("xlsx");
				const worksheet = excel.utils.json_to_sheet(data.devices);
				const csvData = excel.utils.sheet_to_csv(worksheet);
				saveAs(
					new File([csvData], "data.csv", {
						type: "csv",
					}),
					"DAT Device Summary Report.csv",
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
