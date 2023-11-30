import { useRecoilValue } from "recoil";
import { DashboardFilterState } from "../states/dashboardsHeader";
import { useEffect, useState } from "react";
import {
	head,
	isEmpty,
	flattenDeep,
	filter,
	find,
	groupBy,
	keys,
} from "lodash";
import { mapLimit, parallel } from "async-es";
import { useDataEngine } from "@dhis2/app-runtime";
import { useSearchParams } from "react-router-dom";
import {
	DEFAULT_PAGE_SIZE,
	EVENTS_PAGINATION_QUERY,
	EVENTS_QUERY,
	TRACKED_ENTITY_ATTRIBUTE_QUERY,
	TRACKED_ENTITY_INSTANCE_PAGINATION_QUERY,
	TRACKED_ENTITY_INSTANCE_QUERY,
} from "../constants";
import { PeriodUtility, TrackedEntityInstance } from "@hisptz/dhis2-utils";
import { useSetting } from "@dhis2/app-service-datastore";
import { getDhis2FormattedDate } from "../../shared/utils";
import { Event, Option, TrackedEntityAttribute } from "../../shared/types";
import { DateTime } from "luxon";
import { DATA_ELEMENTS } from "../../shared/constants";

const CONCURRENT_REQUESTS = 5;
type EnrollmentSummary = {
	numberOfClients: number;
	numberOfDevices: number;
	clientsRegisteredIntoDAT: number;
	enrollmentBySex: {
		[sex: string]: string;
	};
}

type AdherenceSummary = {
	totalDeviceSignalEvents: number;
	deviceSignalsForDoseTake: number;
}

function getEnrollmentSummary(
	trackedEntityInstances: TrackedEntityInstance[],
	attributes: Record<string, string>,
	sexAttributeOptions: any[],
): any {
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

function getAdherenceSummary(events: Event[]): AdherenceSummary {
	const doseTakenSignals = ["Once", "Multiple"];

	const eventForDoseTaken = filter(events, ({ dataValues }) => {
		const deviceSignalDataValue = find(
			dataValues,
			({ dataElement }) => dataElement === DATA_ELEMENTS.DEVICE_SIGNAL,
		);

		return (
			deviceSignalDataValue &&
			doseTakenSignals.includes(deviceSignalDataValue.value)
		);
	});

	const countOfEventsForDoseTaken = keys(
		groupBy(eventForDoseTaken, "trackedEntityInstance"),
	).length;

	const countOfEventUniqueByTei = keys(
		groupBy(events, "trackedEntityInstance"),
	).length;

	return {
		totalDeviceSignalEvents: countOfEventUniqueByTei,
		deviceSignalsForDoseTake: countOfEventsForDoseTaken,
	};
}

function getPaginationList(totalItems: number): number[] {
	let pages: number[] = [];
	for (
		let page = 1;
		page <= Math.ceil(totalItems / DEFAULT_PAGE_SIZE);
		page++
	) {
		pages = [...pages, page];
	}
	return pages;
}

export function useDefaultDashboardData() {
	const [loadingEnrollemntStatus, setLoadingEnrollemntStatus] =
		useState<boolean>(false);
	const [loadingAdherenceSummary, setLoadingAdherenceSummary] =
		useState<boolean>(false);
	const [enrollemntStatusError, setEnrollemntStatusError] =
		useState<any>(null);
	const [adherenceSummaryError, setAdherenceSummaryError] =
		useState<any>(null);
	const [enrollmentSummary, setEnrollmentSummary] =
		useState<EnrollmentSummary | null>(null);
	const [adherenceSummary, setAdherenceSummary] =
		useState<AdherenceSummary | null>(null);

	const [ searchParams] = useSearchParams();
	const engine = useDataEngine();
	const controller = new AbortController();
	const { orgUnit: selectedOrgUnits, periods: selectedPeriods } =
		useRecoilValue(DashboardFilterState);
	const [programMapping] = useSetting("programMapping", { global: true });
	const [devices] = useSetting("deviceIMEIList", { global: true });

	const ouParams = searchParams.get("ou");
	const peParams = searchParams.get("pe");

	const ou = ouParams ? head(ouParams.split(";")) : head(selectedOrgUnits?.orgUnits)?.id ?? "";
	const { start: startDate, end: endDate } = PeriodUtility.getPeriodById(
		head(peParams ? peParams.split(";") :selectedPeriods),
	);

	const today = DateTime.now().minus({ days: 1 }).toFormat("yyyy-MM-dd");
	const trackedEntityInstanceQueryParams = {
		program: programMapping?.program ?? "",
		ou,
		startDate: getDhis2FormattedDate(startDate),
		endDate: getDhis2FormattedDate(endDate),
	};
	const eventsQueryParams = {
		programStage: programMapping?.programStage ?? "",
		orgUnit: ou,
		startDate: today,
		endDate: today,
	};

	const getTrackedEntityInstancePaginations = async (): Promise<number[]> => {
		const data = await engine.query(
			TRACKED_ENTITY_INSTANCE_PAGINATION_QUERY,
			{
				variables: trackedEntityInstanceQueryParams,
			},
		);
		const { pager } = (data.query as any) ?? {};
		return getPaginationList(pager.total ?? 0);
	};

	const getEventsPaginations = async (): Promise<number[]> => {
		const data = await engine.query(EVENTS_PAGINATION_QUERY, {
			variables: eventsQueryParams,
		});
		const { pager } = (data.query as any) ?? {};
		return getPaginationList(pager.total ?? 0);
	};

	const getTrackedEntityInstances = async (
		page: number,
	): Promise<TrackedEntityInstance[]> => {
		let trackedEntityInstances: TrackedEntityInstance[] = [];
		try {
			const data = await engine.query(TRACKED_ENTITY_INSTANCE_QUERY, {
				variables: {
					...trackedEntityInstanceQueryParams,
					page,
				},
				signal: controller.signal,
			});
			const fetchedTrackedEntityInstances =
				(data?.query as any).trackedEntityInstances ?? [];
			trackedEntityInstances = [
				...trackedEntityInstances,
				fetchedTrackedEntityInstances,
			];
		} catch (error: any) {
			setEnrollemntStatusError(error);
		}

		return trackedEntityInstances;
	};

	const getEvents = async (page: number): Promise<Event[]> => {
		let events: Event[] = [];

		try {
			const data = await engine.query(EVENTS_QUERY, {
				variables: {
					...eventsQueryParams,
					page,
				},
				signal: controller.signal,
			});

			const fetchedEvents = (data?.query as any).events ?? [];
			events = [...events, fetchedEvents];
		} catch (error: any) {
			setAdherenceSummaryError(error);
		}
		return events;
	};

	const getSexOptionsMapping = async (): Promise<Array<Option>> => {
		const { sex: sexAttributeId } = programMapping?.attributes ?? {};
		let options: Option[] = [];
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

	const fetchEnrollemntSummary = async (): Promise<void> => {
		try {
			setLoadingEnrollemntStatus(true);
			setEnrollemntStatusError(null);
			await getTrackedEntityInstancePaginations().then(
				async (totalPages) => {
					let trackedEntityInstances = await mapLimit(
						totalPages,
						CONCURRENT_REQUESTS,
						async (page: number) => {
							return await getTrackedEntityInstances(page);
						},
					);
					trackedEntityInstances = flattenDeep(
						trackedEntityInstances,
					);

					const numberOfClients = trackedEntityInstances.length;
					const numberOfDevices = (devices ?? []).length;

					const sexAttributeOptions = await getSexOptionsMapping();
					const { clientsRegisteredIntoDAT, enrollmentBySex } =
						getEnrollmentSummary(
							trackedEntityInstances,
							programMapping?.attributes,
							sexAttributeOptions,
						);

					setEnrollmentSummary({
						numberOfClients,
						numberOfDevices,
						clientsRegisteredIntoDAT,
						enrollmentBySex,
					});
				},
				(error) => {
					setEnrollemntStatusError(error?.toString());
				},
			);
		} catch (error: any) {
			setEnrollemntStatusError(error);
		} finally {
			setLoadingEnrollemntStatus(false);
		}
	};

	const fetchAdherenceSummary = async (): Promise<void> => {
		try {
			setLoadingAdherenceSummary(true);
			await getEventsPaginations().then(
				async (totalPages) => {
					let events: Event[] = await mapLimit(
						totalPages,
						CONCURRENT_REQUESTS,
						async (page: number) => {
							return await getEvents(page);
						},
					);
					events = flattenDeep(events);
					setAdherenceSummary(getAdherenceSummary(events));
				},
				(error: any) => {
					setAdherenceSummaryError(error);
				},
			);
		} catch (error) {
			setAdherenceSummaryError(error);
		} finally {
			setLoadingAdherenceSummary(false);
		}
	};

	useEffect(() => {
		async function getDefaultDashboardData() {
			await parallel(
				// Fetching enrollment summary
				fetchEnrollemntSummary(),
				// Fetching adherence summary
				fetchAdherenceSummary(),
			);
		}
		setTimeout(async() => {
			await getDefaultDashboardData();
		}, 300);

		return () => {
			controller.abort();
		};
	}, [selectedOrgUnits, selectedPeriods]);

	return {
		loadingEnrollemntStatus,
		loadingAdherenceSummary,
		enrollemntStatusError,
		adherenceSummaryError,
		enrollmentSummary,
		adherenceSummary,
	};
}
