import { useRecoilValue } from "recoil";
import { DashboardFilterState } from "../states/dashboardsHeader";
import { useEffect, useState } from "react";
import { head, isEmpty, flattenDeep, filter, find } from "lodash";
import { mapLimit } from "async-es";
import { useDataEngine } from "@dhis2/app-runtime";

import {
	DEFAULT_PAGE_SIZE,
	TRACKED_ENTITY_INSTANCE_PAGINATION_QUERY,
	TRACKED_ENTITY_INSTANCE_QUERY,
} from "../constants";
import { PeriodUtility, TrackedEntityInstance } from "@hisptz/dhis2-utils";
import { useSetting } from "@dhis2/app-service-datastore";
import { getDhis2FormattedDate } from "../../shared/utils";

interface EnrollmentSummary {
	numberOfClientsWithDevices: number;
	adherencePercentage: number;
	enrollmentBySex: {
		male: number;
		female: number;
	};
}

interface DefaultDashboardData extends EnrollmentSummary {
	numberOfClients: number;
	numberOfDevices: number;
}

function getEnrollmentSummary(
	trackedEntityInstances: TrackedEntityInstance[],
	attributes: Record<string, string>,
): Record<string, string | number> {
	const { sex, deviceIMEInumber } = attributes;

	const enrolledClients = filter(trackedEntityInstances, ({ attributes }) => {
		const deviceAttribute = find(
			attributes,
			({ attribute }) => attribute === deviceIMEInumber,
		);
		return (
			deviceAttribute &&
			deviceAttribute?.value &&
			!isEmpty(`${deviceAttribute?.value}`)
		);
	});

	return {
		clientsRegisteredIntoDat: enrolledClients.length,
		enrollmentBySex: 0,
	};
}

export function useDefaultDashboardData() {
	const [loadingEnrollemntStatus, setLoadingEnrollemntStatus] =
		useState<boolean>(false);
	const [error, setError] = useState<any>(null);
	const [defaultDashboardData, setDefaultDashboardData] =
		useState<DefaultDashboardData | null>();

	const engine = useDataEngine();
	const controller = new AbortController();
	const { orgUnit: selectedOrgUnits, periods: selectedPeriods } =
		useRecoilValue(DashboardFilterState);
	const [programMapping] = useSetting("programMapping", { global: true });
	const [devices] = useSetting("deviceIMEIList", { global: true });

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
			page <= Math.ceil(totalItems / DEFAULT_PAGE_SIZE);
			page++
		) {
			pages = [...pages, page];
		}
		return pages;
	};

	const getTrackedEntityInstancePaginations = async (): Promise<number[]> => {
		const data = await engine.query(
			TRACKED_ENTITY_INSTANCE_PAGINATION_QUERY,
			{
				variables: queryParams,
			},
		);
		const { pager } = (data.query as any) ?? {};
		return getTrackedEntityInstancePages(pager.total ?? 0);
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
			setLoadingEnrollemntStatus(true);
			setError(null);
			setDefaultDashboardData(null);

			try {
				await getTrackedEntityInstancePaginations().then(
					async (totalPages) => {
						let trackedEntityInstances = await mapLimit(
							totalPages,
							5,
							async (page: number) => {
								return await getTrackedEntityInstances(page);
							},
						);
						trackedEntityInstances = flattenDeep(
							trackedEntityInstances,
						);

						// TODO get sanitized data
						const numberOfClients = trackedEntityInstances.length;
						const numberOfDevices = (devices ?? []).length;

						const { clientsRegisteredIntoDat, enrollmentBySex } =
							getEnrollmentSummary(
								trackedEntityInstances,
								programMapping?.attributes,
							);

						console.log({
							numberOfClients,
							numberOfDevices,
							clientsRegisteredIntoDat,
							enrollmentBySex,
						});
					},
					(error) => {
						setError(error?.toString());
					},
				);
			} catch (error) {
				setError(error?.toString());
				setLoadingEnrollemntStatus(false);
			} finally {
				setLoadingEnrollemntStatus(false);
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
		loadingEnrollemntStatus,
		error,
		defaultDashboardData,
	};
}
