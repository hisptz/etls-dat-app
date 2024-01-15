import { useDataQuery } from "@dhis2/app-runtime";
import { useEffect, useState } from "react";
import { Pagination } from "@hisptz/dhis2-utils";
import { useSearchParams } from "react-router-dom";
import { compact, isEmpty } from "lodash";
import { useDownloadData } from "../../../utils/download";
import { PatientProfile } from "../../../../shared/models";
import {
	DAT_PROGRAM,
	ProgramMapping,
	TEI_FIELDS,
} from "../../../../shared/constants";
import { TrackedEntity } from "../../../../shared/types";
import { useSetting } from "@dhis2/app-service-datastore";
import { useRecoilValue } from "recoil";
import { CurrentUserOrganizationUnit } from "../../../../shared/state/currentUser";
import { getProgramMapping } from "../../../../shared/utils";

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
			order,
		}: {
			page: number;
			pageSize: number;
			filters?: string[];
			startDate?: string;
			endDate?: string;
			program: string;
			orgUnit?: string;
			order?: string;
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
			order: order,
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

export function filterObject(programMapping: ProgramMapping) {
	const filtersConfig: any = {
		patientNumber: {
			attribute: programMapping?.attributes?.patientNumber,
			operator: "eq",
		},
		deviceIMEInumber: {
			attribute: programMapping?.attributes?.deviceIMEInumber,
			operator: "eq",
		},
		firstName: {
			attribute: programMapping?.attributes?.firstName,
			operator: "like",
		},
		surname: {
			attribute: programMapping?.attributes?.surname,
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

	const currentProgram = params.get("program");

	const mapping = getProgramMapping(programMapping, currentProgram);

	const filters = compact(
		Array.from(params.keys()).map((filter) => {
			const filterConfig = mapping
				? filterObject(mapping).filtersConfig[filter]
				: null;
			if (filterConfig) {
				const value = params.get(filter);
				if (value) {
					return filter != "deviceIMEInumber"
						? `${filterConfig.attribute}:${filterConfig.operator}:${value}`
						: `${filterConfig.attribute}:${
								filterConfig.operator
						  }:${value}:ne:${null}`;
				} else {
					return `${filterConfig.attribute}:ne:${null}`;
				}
			}
		}),
	);

	const containsDeviceIMEIfilter = filters.some((item) =>
		item.includes(mapping?.attributes?.deviceIMEInumber ?? ""),
	);

	if (!containsDeviceIMEIfilter) {
		filters.push(`${mapping?.attributes?.deviceIMEInumber}:ne:${null}`);
	}

	return {
		filters,
		startDate: params.get("startDate"),
		endDate: params.get("endDate"),
	};
}

export function useDATClientTableData() {
	const defaultOrganizationUnit = useRecoilValue(CurrentUserOrganizationUnit);
	const { filters, startDate } = useFilters();
	const [patients, setPatients] = useState<PatientProfile[]>([]);
	const [programMapping] = useSetting("programMapping", {
		global: true,
	});
	const [regimenSetting] = useSetting("regimenSetting", {
		global: true,
	});
	const [sortState, setSortState] = useState<{
		name: string;
		direction: "asc" | "desc" | "default";
	}>();
	const [pagination, setPagination] = useState<Pagination>();
	const [params] = useSearchParams();
	const currentProgram = params.get("program");

	const orgUnit =
		params.get("ou") ??
		defaultOrganizationUnit.map(({ id }) => id).join(";");
	const mapping = getProgramMapping(programMapping, currentProgram) ?? {};
	const { data, loading, error, refetch } = useDataQuery<Data>(query, {
		variables: {
			page: 1,
			pageSize: 10,
			program: mapping?.program,
			startDate,
			filters,
			orgUnit,
			order: "enrolledAt:desc",
		},

		lazy: !mapping,
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
					return new PatientProfile(tei, mapping, regimenSetting);
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
	}, [data, currentProgram]);

	useEffect(() => {
		if (!isEmpty(programMapping)) {
			refetch({ program: mapping?.program, page: 1, filters, orgUnit });
		}
	}, [currentProgram]);

	const { download, downloading } = useDownloadData({
		resource: "tracker/trackedEntities",
		query: query,
		queryKey: "report",
		mapping: (data: TrackedEntity) => {
			return new PatientProfile(data, mapping, regimenSetting).tableData;
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

	const onSort = (sort: any) => {
		if (sort.direction === "default") {
			const columnId =
				sort.name === "treatmentStart"
					? "enrolledAt"
					: mapping.attributes
					? mapping.attributes[sort.name]
					: "";
			refetch({ order: `${columnId}:asc` });
		}

		if (sort.direction === "asc") {
			const columnId =
				sort.name === "treatmentStart"
					? "enrolledAt"
					: mapping.attributes
					? mapping.attributes[sort.name]
					: "";
			refetch({ order: `${columnId}:asc` });
		} else {
			const columnId =
				sort.name === "treatmentStart"
					? "enrolledAt"
					: mapping.attributes
					? mapping.attributes[sort.name]
					: "";
			refetch({ order: `${columnId}:desc` });
		}
		setSortState(sort);
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
		onSort,
		sortState,
	};
}
