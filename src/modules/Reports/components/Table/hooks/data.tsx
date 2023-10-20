import { useDataQuery } from "@dhis2/app-runtime";
import { useEffect, useState } from "react";
import { Pagination } from "@hisptz/dhis2-utils";
import { useSearchParams } from "react-router-dom";
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
	const [reports, setreports] = useState<PatientProfile[]>([]);
	const [programMapping] = useSetting("programMapping", {
		global: true,
	});
	const [regimenSetting] = useSetting("regimenSetting", {
		global: true,
	});
	const [pagination, setPagination] = useState<Pagination>();
	const [params] = useSearchParams();
	const orgUnit = params.get("ou");
	const reportType = params.get("reportType");
	const [reportConfigs] = useSetting("reports", { global: true });

	const endDate = DateTime.now().toFormat("yyyy-MM-dd");
	const startDate = DateTime.now().minus({ year: 1 }).toFormat("yyyy-MM-dd");

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
