import { useRecoilValue } from "recoil";
import { DashboardFilterState } from "../states/dashboardsHeader";
import { useEffect, useState } from "react";
import { head, isEmpty, flattenDeep, filter, forIn, find } from "lodash";
import { mapLimit, parallel } from "async-es";
import { useDataEngine } from "@dhis2/app-runtime";
import { useSearchParams } from "react-router-dom";
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
import { asyncify } from "async";
import { ProgramMapping } from "../../shared/constants";

const CONCURRENT_REQUESTS = 5;
type EnrollmentSummary = {
	numberOfClients: number;
	numberOfDevices: number;
	clientsRegisteredIntoDAT: number;
	enrollmentBySex: {
		[sex: string]: number;
	};
};

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
	const [enrollemntStatusError, setEnrollemntStatusError] =
		useState<any>(null);
	const [enrollmentSummary, setEnrollmentSummary] =
		useState<EnrollmentSummary | null>(null);

	const [searchParams] = useSearchParams();
	const engine = useDataEngine();
	const controller = new AbortController();
	const { orgUnit: selectedOrgUnits, periods: selectedPeriods } =
		useRecoilValue(DashboardFilterState);
	const [selectedPrograms] = useSearchParams();
	const selectedProgramId = selectedPrograms.get("program");

	const [programMappings] = useSetting("programMapping", { global: true });
	const [devices] = useSetting("deviceIMEIList", { global: true });

	const ouParams = searchParams.get("ou");
	const peParams = searchParams.get("pe");

	const ou = ouParams
		? head(ouParams.split(";"))
		: head(selectedOrgUnits?.orgUnits)?.id ?? "";
	const { start: startDate, end: endDate } = PeriodUtility.getPeriodById(
		head(peParams ? peParams.split(";") : selectedPeriods),
	);

	const trackedEntityInstanceQueryParams = {
		ou,
		startDate: getDhis2FormattedDate(startDate),
		endDate: getDhis2FormattedDate(endDate),
	};
	const getTrackedEntityInstancePaginations = async (
		program: string,
	): Promise<number[]> => {
		const data = await engine.query(
			TRACKED_ENTITY_INSTANCE_PAGINATION_QUERY,
			{
				variables: { ...trackedEntityInstanceQueryParams, program },
			},
		);
		const { pager } = (data.query as any) ?? {};
		return getPaginationList(pager.total ?? 0);
	};

	const getTrackedEntityInstances = async (
		program: string,
		page: number,
	): Promise<TrackedEntityInstance[]> => {
		let trackedEntityInstances: TrackedEntityInstance[] = [];
		try {
			const data = await engine.query(TRACKED_ENTITY_INSTANCE_QUERY, {
				variables: {
					...trackedEntityInstanceQueryParams,
					page,
					program,
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

	const getSexOptionsMapping = async (
		mapping: ProgramMapping,
	): Promise<Array<Option>> => {
		const { sex: sexAttributeId } = mapping.attributes ?? {};
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

	const aggregateEnrollmentSummary = (
		aggregatedEnrollmentSummary: EnrollmentSummary | any,
		numberOfClients: number,
		clientsRegisteredIntoDAT: number,
		enrollmentBySex: { [key: string]: number },
	): EnrollmentSummary => {
		let { enrollmentBySex: summarizedEnrollmentBySex } =
			aggregatedEnrollmentSummary ?? {};

		forIn(enrollmentBySex, (enrollmentCount, sex) => {
			summarizedEnrollmentBySex = {
				...summarizedEnrollmentBySex,
				[sex]:
					(summarizedEnrollmentBySex?.[sex] ?? 0) + enrollmentCount,
			};
		});

		const numberOfDevices = (devices ?? []).length;
		return {
			...aggregatedEnrollmentSummary,
			numberOfDevices,
			numberOfClients:
				(aggregatedEnrollmentSummary?.numberOfClients || 0) +
					numberOfClients ?? 0,
			clientsRegisteredIntoDAT:
				(aggregatedEnrollmentSummary?.clientsRegisteredIntoDAT || 0) +
					clientsRegisteredIntoDAT ?? 0,
			enrollmentBySex: summarizedEnrollmentBySex ?? {},
		};
	};

	const fetchEnrollemntSummary = async (
		programMapping: ProgramMapping[],
	): Promise<void> => {
		try {
			programMapping = filter(programMapping, ({ program }) => {
				return program === selectedProgramId;
			});
			setLoadingEnrollemntStatus(true);
			let aggregatedEnrollmentSummary: EnrollmentSummary | any = {};
			if (programMapping.length) {
				for (const mapping of programMapping.reverse()) {
					await getTrackedEntityInstancePaginations(
						mapping.program ?? "",
					).then(
						async (totalPages) => {
							let trackedEntityInstances = await mapLimit(
								totalPages,
								CONCURRENT_REQUESTS,
								async (page: number) => {
									return await getTrackedEntityInstances(
										mapping.program ?? "",
										page,
									);
								},
							);
							trackedEntityInstances = flattenDeep(
								trackedEntityInstances,
							);
							const numberOfClients =
								trackedEntityInstances.length;
							const sexAttributeOptions =
								await getSexOptionsMapping(mapping);
							const {
								clientsRegisteredIntoDAT,
								enrollmentBySex,
							} = getEnrollmentSummary(
								trackedEntityInstances,
								mapping.attributes || {},
								sexAttributeOptions,
							);

							aggregatedEnrollmentSummary =
								aggregateEnrollmentSummary(
									aggregatedEnrollmentSummary,
									numberOfClients,
									clientsRegisteredIntoDAT,
									enrollmentBySex,
								);
						},
						(error) => {
							setEnrollemntStatusError(error?.toString());
						},
					);
				}

				setEnrollmentSummary(aggregatedEnrollmentSummary);
			}
		} catch (error: any) {
			setEnrollemntStatusError(error);
		}
		setLoadingEnrollemntStatus(false);
	};

	useEffect(() => {
		async function getDefaultDashboardData() {
			await asyncify(
				parallel(
					// Fetching enrollment summary
					fetchEnrollemntSummary(programMappings ?? []),
				),
			);
		}
		setTimeout(async () => {
			await getDefaultDashboardData();
		}, 300);

		return () => {
			controller.abort();
		};
	}, [selectedOrgUnits, selectedPeriods, selectedProgramId]);

	return {
		loadingEnrollemntStatus,
		enrollemntStatusError,
		enrollmentSummary,
	};
}
