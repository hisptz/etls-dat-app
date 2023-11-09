import { useRecoilValue } from "recoil";
import { DashboardFilterState } from "../states/dashboardsHeader";
import { useEffect, useState } from "react";
import { head, map, flattenDeep } from "lodash";
import { mapLimit } from "async-es";
import { useDataEngine } from "@dhis2/app-runtime";

import {
	TEI_PAGE_SIZE,
	TRACKED_ENTITY_INSTANCE_PAGINATION_QUERY,
	TRACKED_ENTITY_INSTANCE_QUERY,
} from "../constants";
import { PeriodUtility, TrackedEntityInstance } from "@hisptz/dhis2-utils";
import { useSetting } from "@dhis2/app-service-datastore";
import { getDhis2FormattedDate } from "../../shared/utils";

export function useDefaultDashboardData() {
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<any>(null);
	const engine = useDataEngine();
	const controller = new AbortController();
	const { orgUnit: selectedOrgUnits, periods: selectedPeriods } =
		useRecoilValue(DashboardFilterState);
	const [programMapping] = useSetting("programMapping", { global: true });

	const { start: startDate, end: endDate } = PeriodUtility.getPeriodById(
		head(selectedPeriods),
	);
	const ou = head(selectedOrgUnits?.orgUnits)?.id ?? "";

	const queryParams = {
		program: programMapping?.program ?? "",
		ou,
		startDate: getDhis2FormattedDate(startDate),
		endDate: getDhis2FormattedDate(endDate),
	};

	const getTrackedEntityInstancePages = (totalItems: number): number[] => {
		let pages: number[] = [];
		for (
			let page = 1;
			page <= Math.ceil(totalItems / TEI_PAGE_SIZE);
			page++
		) {
			pages = [...pages, page];
		}
		return pages;
	};

	const getTrackedEntityInstances = async (
		page: number,
	): Promise<TrackedEntityInstance[]> => {
		let trackedEntityInstances: TrackedEntityInstance[] = [];
		try {
			const data = await engine.query(TRACKED_ENTITY_INSTANCE_QUERY, {
				variables: {
					...queryParams,
					page,
				},
				signal: controller.signal,
			});
			trackedEntityInstances = data
				? [
						...trackedEntityInstances,
						...((data?.query as any)
							.trackedEntityInstances as TrackedEntityInstance[]),
				  ]
				: [];
		} catch (error) {
			setError(error);
		}

		return trackedEntityInstances;
	};

	useEffect(() => {
		async function getDefaultDashboardData() {
			setLoading(true);
			setError(null);

			try {
				await engine
					.query(TRACKED_ENTITY_INSTANCE_PAGINATION_QUERY, {
						variables: queryParams,
					})
					.then(
						async (data: any) => {
							const { pager } = (data.query as any) ?? {};
							const totalPages = getTrackedEntityInstancePages(
								pager.total ?? 0,
							);
							let trackedEntityInstances = await mapLimit(
								totalPages,
								5,
								async (page: number) => {
									return await getTrackedEntityInstances(
										page,
									);
								},
							);
							trackedEntityInstances = flattenDeep(
								trackedEntityInstances,
							);
						},
						(error) => {
							console.log(`pagination: ${error?.toString()}`);
							setError(error?.toString());
						},
					);
			} catch (error) {
				console.log(`pagination: ${error?.toString()}`);
				setError(error?.toString());
				setLoading(false);
			} finally {
				setLoading(false);
			}
		}
		setTimeout(() => {
			getDefaultDashboardData();
		}, 300);

		return () => {
			controller.abort();
		};
	}, [selectedOrgUnits, selectedPeriods]);

	return {
		loading,
		error,
	};
}
