import { useDataQuery } from "@dhis2/app-runtime";
import { useEffect, useState } from "react";
import { Pagination } from "@hisptz/dhis2-utils";
import { useSearchParams } from "react-router-dom";
import { compact, isEmpty } from "lodash";
import { useDownloadData } from "../../../utils/download";
import { PatientProfile } from "../../../../shared/models";
import {
	DAT_PROGRAM,
	programMapping,
	TEI_FIELDS,
} from "../../../../shared/constants";
import { TrackedEntity } from "../../../../shared/types";
import { useSetting } from "@dhis2/app-service-datastore";

const query: any = {
	patients: {
		resource: "tracker/trackedEntities",
		params: ({
			page,
			pageSize,
			filters,
			startDate,
			endDate,
			program,
			orgUnit,
		}: {
			page: number;
			pageSize: number;
			filters?: string[];
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
			filter: filters,
			totalPages: true,
			ouMode: "DESCENDANTS",
			fields: TEI_FIELDS,
		}),
	},
};

type Data = {
	patients: {
		instances: TrackedEntity[];
		page: number;
		pageSize: number;
		total: number;
	};
};

export function filterObject(programMapping: programMapping) {
	const filtersConfig: any = {
		patientNumber: {
			attribute: programMapping.attributes?.tbDistrictNumber,
			operator: "eq",
		},
		deviceIMEInumber: {
			attribute: programMapping.attributes?.deviceIMEInumber,
			operator: "eq",
		},
		firstName: {
			attribute: programMapping.attributes?.firstName,
			operator: "like",
		},
		surname: {
			attribute: programMapping.attributes?.surname,
			operator: "like",
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

export function useTBAdherenceTableData() {
	const { filters, startDate } = useFilters();
	const [patients, setPatients] = useState<PatientProfile[]>([]);
	const [programMapping] = useSetting("programMapping", {
		global: true,
	});
	const [regimenSetting] = useSetting("regimenSetting", {
		global: true,
	});
	const [pagination, setPagination] = useState<Pagination>();
	const [params] = useSearchParams();
	const orgUnit = params.get("ou");

	const { data, loading, error, refetch } = useDataQuery<Data>(query, {
		variables: {
			page: 1,
			pageSize: 10,
			program: DAT_PROGRAM(),
			startDate,
			filters,
			orgUnit,
		},
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
			setPatients(
				data?.patients.instances.map((tei) => {
					return new PatientProfile(
						tei,
						programMapping,
						regimenSetting,
					);
				}) ?? [],
			);
			setPagination({
				page: data?.patients.page,
				pageSize: data?.patients.pageSize,
				total: data?.patients.total,
				pageCount: Math.ceil(
					data?.patients.total / data?.patients.pageSize,
				),
			});
		}
	}, [data]);

	const { download, downloading } = useDownloadData({
		resource: "tracker/trackedEntities",
		query: query,
		queryKey: "report",
		mapping: (data: TrackedEntity) => {
			return new PatientProfile(data, programMapping, regimenSetting)
				.tableData;
		},
	});

	const onDownload = (type: "xlsx" | "csv" | "json") => {
		if (!isEmpty(orgUnit) && !isEmpty(startDate)) {
			download(type, {
				orgUnit,
				filters,
				program: DAT_PROGRAM(),
			});
		}
	};

	return {
		pagination: {
			...pagination,
			onPageSizeChange,
			onPageChange,
		},
		patients,
		downloading,
		download: onDownload,
		loading,
		error,
		refetch,
	};
}
