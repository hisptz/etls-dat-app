import { useDataQuery } from "@dhis2/app-runtime";
import { useEffect, useState } from "react";
import { Pagination } from "@hisptz/dhis2-utils";
import { useSearchParams } from "react-router-dom";
import { compact, isEmpty } from "lodash";
import { useDownloadData } from "../../../utils/download";
import { PatientProfile } from "../../../../shared/models";
import {
	DAT_PROGRAM,
	SHARED_ATTRIBUTES,
	TEI_FIELDS,
} from "../../../../shared/constants";
import { TrackedEntity } from "../../../../shared/types";

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
const filtersConfig: any = {
	tbDistrictNumber: {
		attribute: SHARED_ATTRIBUTES.TB_DISTRICT_NUMBER,
		operator: "eq",
	},
	deviceEMInumber: {
		attribute: SHARED_ATTRIBUTES.DEVICE_NUMBER,
		operator: "eq",
	},
};

export function useFilters() {
	const [params] = useSearchParams();
	const filters = compact(
		Array.from(params.keys()).map((filter) => {
			const filterConfig = filtersConfig[filter];
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
	const { filters, startDate, endDate } = useFilters();
	const [patients, setPatients] = useState<PatientProfile[]>([]);

	const [pagination, setPagination] = useState<Pagination>();
	const [params] = useSearchParams();
	const orgUnit = params.get("ou");

	const { data, loading, error, refetch } = useDataQuery<Data>(query, {
		variables: {
			page: 1,
			pageSize: 10,
			program: DAT_PROGRAM,
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
			setPatients(
				data?.patients.instances.map((tei) => {
					return new PatientProfile(tei);
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
			return new PatientProfile(data).tableData;
		},
	});

	const onDownload = (type: "xlsx" | "csv" | "json") => {
		if (!isEmpty(orgUnit) && !isEmpty(startDate) && !isEmpty(endDate)) {
			download(type, {
				orgUnit,

				filters,
				program: DAT_PROGRAM,
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
