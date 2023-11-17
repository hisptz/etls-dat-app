import { useRecoilValue } from "recoil";
import { DashboardFilterState } from "../states/dashboardsHeader";
import { useEffect, useState } from "react";
import { head, isEmpty, flattenDeep, filter, find } from "lodash";
import { mapLimit } from "async-es";
import { useDataEngine } from "@dhis2/app-runtime";

import {
	DEFAULT_PAGE_SIZE,
	TRACKED_ENTITY_ATTRIBUTE_QUERY,
	TRACKED_ENTITY_INSTANCE_PAGINATION_QUERY,
	TRACKED_ENTITY_INSTANCE_QUERY,
} from "../constants";
import { PeriodUtility, TrackedEntityInstance } from "@hisptz/dhis2-utils";
import { useSetting } from "@dhis2/app-service-datastore";
import { getDhis2FormattedDate } from "../../shared/utils";
import { Option, TrackedEntityAttribute } from "../../shared/types";

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
	sexAttributeOptions: any[],
): Record<string, number | Record<string, number>> {
	let enrollmentBySex: { [key: string]: number } = {};
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

	for (const option of sexAttributeOptions) {
		const { code, name } = option;
		enrollmentBySex = {
			...enrollmentBySex,
			[name]: filter(trackedEntityInstances, ({ attributes }) => {
				const sexAttribute = find(
					attributes,
					({ attribute }) => attribute === sex,
				);
				return sexAttribute?.value === code;
			}).length,
		};
	}

	return {
		clientsRegisteredIntoDAT: enrolledClients.length,
		enrollmentBySex,
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

	const getSexOptionsMapping = async (): Promise<
		{ name: string; code: string }[]
	> => {
		const { sex: sexAttributeId } = programMapping?.attributes ?? {};
		let options: { name: string; code: string }[] = [];
		try {
			const { query: teiAttribute } = (await engine.query(
				TRACKED_ENTITY_ATTRIBUTE_QUERY,
				{
					variables: { id: sexAttributeId ?? "" },
				},
			)) as { query: TrackedEntityAttribute };
			options = teiAttribute ? teiAttribute.optionSet.options : options;
		} catch (error) {
			// Options don't exist
		}
		return options;
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

						const sexAttributeOptions =
							await getSexOptionsMapping();
						const { clientsRegisteredIntoDAT, enrollmentBySex } =
							getEnrollmentSummary(
								trackedEntityInstances,
								programMapping?.attributes,
								sexAttributeOptions,
							);

						console.log({
							numberOfClients,
							numberOfDevices,
							clientsRegisteredIntoDAT,
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
