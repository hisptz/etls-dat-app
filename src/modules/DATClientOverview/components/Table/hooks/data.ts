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
			program,
			orgUnit,
			order,
		}: {
			page: number;
			pageSize: number;
			filters?: string[];
			program: string;
			orgUnit?: string;
			order?: string;
		}) => ({
			pageSize,
			page,
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
					return `${filterConfig.attribute}:${filterConfig.operator}:${value}`;
				}
			}
		}),
	);

	return {
		filters,
	};
}

export function useDATClientTableData() {
	const defaultOrganizationUnit = useRecoilValue(CurrentUserOrganizationUnit);
	const { filters } = useFilters();
	const [currentPage, setCurrentPage] = useState<number>();
	const [patients, setPatients] = useState<PatientProfile[]>([]);
	const [refreshing, setLoading] = useState<boolean>(false);
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
			filters,
			orgUnit,
			order: `${mapping?.attributes?.deviceIMEInumber}:asc,enrolledAt:desc`,
		},

		lazy: !mapping || isEmpty(programMapping),
	});

	const onPageChange = (page: number) => {
		setCurrentPage(page);
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

	let lastPage: boolean;

	const filterDataForDATClientOverview = (
		data: any,
		attributeValue: string,
	) => {
		return data.filter((item: any) => {
			const hasAttribute = item.attributes?.some(
				(attr: any) => attr.attribute === attributeValue,
			);

			lastPage = !hasAttribute;

			return hasAttribute;
		});
	};

	useEffect(() => {
		if (data) {
			const rawData =
				data?.patients.instances.map((tei) => {
					return new PatientProfile(tei, mapping, regimenSetting);
				}) ?? [];

			const sanitizedData = filterDataForDATClientOverview(
				rawData,
				mapping.attributes?.deviceIMEInumber ?? "",
			);
			isEmpty(sanitizedData)
				? refetch({
						page: (currentPage ?? 2) - 1,
						filters,
						orgUnit,
				  })
				: null;

			setPatients(sanitizedData ?? []);
			setPagination({
				page: data?.patients.page,
				pageSize: data?.patients.pageSize,
				isLastPage: lastPage,
			});
		}
	}, [data, currentProgram]);

	useEffect(() => {
		if (!isEmpty(programMapping)) {
			refetch({ program: mapping?.program, page: 1, filters, orgUnit });
		}
	}, [currentProgram]);

	const refreshingData = async () => {
		await refetch({ program: mapping?.program, page: 1, filters, orgUnit });
		setLoading(false);
	};

	// useEffect(() => {
	// 	setLoading(true);
	// 	if (!isEmpty(programMapping)) {
	// 		refreshingData();
	// 	}
	// }, []);

	const { download, downloading } = useDownloadData({
		resource: "tracker/trackedEntities",
		query: query,
		queryKey: "report",
		mapping: (data: TrackedEntity) => {
			return new PatientProfile(data, mapping, regimenSetting).tableData;
		},
	});

	const onDownload = (type: "xlsx" | "csv" | "json") => {
		if (!isEmpty(orgUnit)) {
			download(type, {
				orgUnit,
				filters,
				program: DAT_PROGRAM(),
			});
		}
	};

	const onSort = (sort: any) => {
		if (sort.direction === "default") {
			sort.name === "treatmentStart"
				? refetch({
						order: `${mapping.attributes?.deviceIMEInumber}:asc,enrolledAt:asc`,
				  })
				: mapping.attributes
				? sort.name === "name"
					? refetch({
							order: `${mapping.attributes?.deviceIMEInumber}:asc,${mapping.attributes?.firstName}:asc`,
					  })
					: refetch({
							order: `${mapping.attributes
								?.deviceIMEInumber}:asc,${
								mapping.attributes[sort.name]
							}:asc`,
					  })
				: "";
		}

		if (sort.direction === "asc") {
			sort.name === "treatmentStart"
				? refetch({
						order: `${mapping.attributes?.deviceIMEInumber}:asc,enrolledAt:asc`,
				  })
				: mapping.attributes
				? sort.name === "name"
					? refetch({
							order: `${mapping.attributes?.deviceIMEInumber}:asc,${mapping.attributes.firstName}:asc`,
					  })
					: refetch({
							order: `${mapping.attributes
								?.deviceIMEInumber}:asc,${
								mapping.attributes[sort.name]
							}:asc`,
					  })
				: "";
		} else {
			sort.name === "treatmentStart"
				? refetch({
						order: `${mapping.attributes?.deviceIMEInumber}:asc,enrolledAt:desc`,
				  })
				: mapping.attributes
				? sort.name === "name"
					? refetch({
							order: `${mapping.attributes?.deviceIMEInumber}:asc,${mapping.attributes.firstName}:desc`,
					  })
					: refetch({
							order: `${mapping.attributes
								?.deviceIMEInumber}:asc,${
								mapping.attributes[sort.name]
							}:desc`,
					  })
				: "";
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
		refreshing,
		download: onDownload,
		loading,
		error,
		refetch,
		onSort,
		sortState,
	};
}
