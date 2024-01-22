import { find } from "lodash";
import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";
import { useSetting } from "@dhis2/app-service-datastore";
import { useSearchParams } from "react-router-dom";
import {
	DATA_ELEMENTS,
	ProgramMapping,
	TRACKED_ENTITY_ATTRIBUTES,
} from "../../../../shared/constants";
import { Program, ProgramTrackedEntityAttribute } from "@hisptz/dhis2-utils";

const programQuery: any = {
	program: {
		resource: "programs",
		id: ({ program }: any) => program,
		params: {
			fields: [":owner", "!programStages"],
		},
	},
};

const metadataMutation: any = {
	type: "create",
	resource: "metadata",
	data: ({ data }: any) => data,
	importMode: "COMMIT",
	identifier: "UID",
	importReportMode: "ERRORS",
	importStrategy: "CREATE_AND_UPDATE",
	atomicMode: "ALL",
	mergeMode: "MERGE",
	flushMode: "AUTO",
	inclusionStrategy: "NON_NULL",
	async: false,
};

function getMigrationMetadataObject(mapping: any): any {
	return {
		programStages: [
			{
				id: mapping.programStage,
				name: "DAT-Adherence Records",
				repeatable: true,
				program: {
					id: mapping.program ?? null,
				},
				programStageDataElements: [
					{
						dataElement: {
							id: DATA_ELEMENTS.DEVICE_HEALTH,
						},
					},
					{
						dataElement: {
							id: DATA_ELEMENTS.BATTERY_HEALTH,
						},
					},
					{
						dataElement: {
							id: DATA_ELEMENTS.DOSAGE_TIME,
						},
					},
					{
						dataElement: {
							id: DATA_ELEMENTS.DEVICE_SIGNAL,
						},
					},
				],
			},
		],
		dataElements: [
			{
				code: "DAT_001",
				id: DATA_ELEMENTS.DEVICE_HEALTH,
				name: "Device health",
				shortName: "Device health",
				aggregationType: "NONE",
				domainType: "TRACKER",
				valueType: "TEXT",
			},
			{
				code: "DAT_002",
				id: DATA_ELEMENTS.BATTERY_HEALTH,
				name: "Battery health",
				shortName: "Battery health",
				aggregationType: "NONE",
				domainType: "TRACKER",
				valueType: "NUMBER",
			},
			{
				code: "DAT_003",
				id: DATA_ELEMENTS.DOSAGE_TIME,
				name: "Dosage time",
				shortName: "Dosage time",
				aggregationType: "NONE",
				domainType: "TRACKER",
				valueType: "DATETIME",
			},
			{
				code: "DAT_004",
				id: DATA_ELEMENTS.DEVICE_SIGNAL,
				name: "Device signal",
				shortName: "Device signal",
				aggregationType: "NONE",
				domainType: "TRACKER",
				valueType: "TEXT",
				optionSet: {
					id: "lpMwLxkJor6",
				},
			},
		],
		trackedEntityAttributes: [
			{
				id: TRACKED_ENTITY_ATTRIBUTES.EPISODE_ID,
				code: "DAT_005",
				name: "DAT Episode ID",
				shortName: "Episode ID",
				description: "Unique identifier for each wisepill episode",
				valueType: "TEXT",
				aggregationType: "NONE",
				displayOnVisitSchedule: false,
				displayInListNoProgram: false,
				confidential: false,
				unique: true,
				generated: false,
			},
			{
				id: TRACKED_ENTITY_ATTRIBUTES.DEVICE_IMEI,
				code: "DAT_006",
				name: "DAT Device IMEI",
				shortName: "Device IMEI",
				description: "Wisepill device IMEI number",
				valueType: "TEXT",
				aggregationType: "NONE",
				displayOnVisitSchedule: false,
				displayInListNoProgram: false,
				confidential: false,
				unique: true,
				generated: false,
			},
		],
		optionSets: [
			{
				id: "lpMwLxkJor6",
				name: "Device signal",
				valueType: "TEXT",
				options: [
					{
						id: "rzRYYkh8jaq",
					},
					{
						id: "bXCWzsKQiIe",
					},
					{
						id: "J4u3MgT8ll3",
					},
					{
						id: "rqvQqekCxF3",
					},
					{
						id: "uvL7HRHHnPu",
					},
				],
			},
		],
		options: [
			{
				id: "rzRYYkh8jaq",
				code: "Once",
				name: "Opened Once",
				sortOrder: 1,
				optionSet: {
					id: "lpMwLxkJor6",
				},
			},
			{
				id: "bXCWzsKQiIe",
				code: "Multiple",
				name: "Opened Multiple",
				sortOrder: 2,
				optionSet: {
					id: "lpMwLxkJor6",
				},
			},
			{
				id: "J4u3MgT8ll3",
				code: "None",
				name: "None",
				sortOrder: 3,
				optionSet: {
					id: "lpMwLxkJor6",
				},
			},
			{
				id: "rqvQqekCxF3",
				code: "Heartbeat",
				name: "Heartbeat",
				sortOrder: 4,
				optionSet: {
					id: "lpMwLxkJor6",
				},
			},
			{
				id: "uvL7HRHHnPu",
				code: "Enrollment",
				name: "Enrollment",
				sortOrder: 5,
				optionSet: {
					id: "lpMwLxkJor6",
				},
			},
		],
	};
}

function getSanitizedProgramMetadataObject(
	program: Program,
	metadata: any,
): Program {
	const { programTrackedEntityAttributes } = program;
	const { trackedEntityAttributes } = metadata;

	const trackedEntityAttributeIds: string[] = trackedEntityAttributes.map(
		({ id }: any) => id ?? "",
	);
	const existingTrackedEntities: string[] = [];

	const sanitizedProgramTrackedEntityAttributes =
		programTrackedEntityAttributes?.map((programTrackedEntityAttribute) => {
			const { trackedEntityAttribute } = programTrackedEntityAttribute;
			if (trackedEntityAttributeIds.includes(trackedEntityAttribute.id)) {
				const sanitizedAttribute = find(
					trackedEntityAttributes,
					({ id }) => id === trackedEntityAttribute.id,
				);
				existingTrackedEntities.push(trackedEntityAttribute.id);
				return {
					...programTrackedEntityAttribute,
					trackedEntityAttribute: sanitizedAttribute,
				};
			} else {
				return programTrackedEntityAttribute;
			}
		}) as ProgramTrackedEntityAttribute[];

	return {
		...program,
		programTrackedEntityAttributes: [
			...sanitizedProgramTrackedEntityAttributes,
			...trackedEntityAttributes
				.filter(({ id }: any) => !existingTrackedEntities.includes(id))
				.map(
					(trackedEntityAttribute: any) =>
						({
							trackedEntityAttribute,
							program: {
								id: program.id,
							},
							id: generateUid(),
							displayName: trackedEntityAttribute.name,
						}) as ProgramTrackedEntityAttribute,
				),
		],
	};
}

export function useProgramMapping() {
	const [params] = useSearchParams();
	const programId = params.get("mappedTbProgram");
	const [programMap] = useSetting("programMapping", { global: true });

	const programStageID =
		programId == programMap.program
			? programMap.programStage
			: generateUid();

	const mediatorUrl = params.get("mediatorUrl");
	const apiKey = params.get("apiKey");
	const firstName = params.get("firstName");
	const surname = params.get("surname");
	const patientNumber = params.get("patientNumber");
	const age = params.get("age");
	const sex = params.get("sex");
	const regimen = params.get("regimen");
	const phoneNumber = params.get("phoneNumber");
	const deviceIMEInumber = params.get("deviceIMEInumber");

	const programMapping: ProgramMapping = {
		program: programId ?? "",
		programStage: programStageID,
		mediatorUrl: mediatorUrl ?? "",
		apiKey: apiKey ?? "",
		attributes: {
			firstName: firstName ?? "",
			surname: surname ?? "",
			patientNumber: patientNumber ?? "",
			age: age ?? "",
			sex: sex ?? "",
			regimen: regimen ?? "",
			phoneNumber: phoneNumber ?? "",
			deviceIMEInumber: deviceIMEInumber ?? "",
		},
	};

	return { programMapping };
}

export function getDefaultFilters() {
	const [programMapping] = useSetting("programMapping", { global: true });
	return new URLSearchParams({
		mappedTbProgram: programMapping.program ?? "",
		mediatorUrl: programMapping.mediatorUrl ?? "",
		apiKey: programMapping.apiKey ?? "",
		firstName: programMapping.attributes?.firstName ?? "",
		surname: programMapping.attributes?.surname ?? "",
		patientNumber: programMapping.attributes?.patientNumber ?? "",
		age: programMapping.attributes?.age ?? "",
		sex: programMapping.attributes?.sex ?? "",
		regimen: programMapping.attributes?.regimen ?? "",
		phoneNumber: programMapping.attributes?.phoneNumber ?? "",
		deviceIMEInumber: programMapping.attributes?.deviceIMEInumber ?? "",
	});
}

export function generateUid() {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const allowedChars = "0123456789$" + letters;
	const numberOfCodePoints = allowedChars.length;
	const codeSize = 11;
	let uid = "";
	const charIndex = Math.floor(((Math.random() * 10) / 10) * letters.length);
	uid = letters.substring(charIndex, charIndex + 1);
	for (let i = 1; i < codeSize; ++i) {
		const charIndex = Math.floor(
			((Math.random() * 10) / 10) * numberOfCodePoints,
		);
		uid += allowedChars.substring(charIndex, charIndex + 1);
	}
	return uid;
}

export function useProgramStage() {
	const [mutate, { loading, error }] = useDataMutation(metadataMutation);
	const { refetch: fetchProgramMetadata } = useDataQuery(programQuery, {
		lazy: true,
	});

	const handleImportProgramStage = async (mapping: any) => {
		const metadata = getMigrationMetadataObject(mapping);
		if (mapping) {
			const { program } = await fetchProgramMetadata({
				program: mapping?.program ?? "",
			});

			const sanitizedProgramMetadata = getSanitizedProgramMetadataObject(
				program as Program,
				metadata,
			);

			const metadataMutationResponse = await mutate({
				data: { ...metadata, programs: [sanitizedProgramMetadata] },
			});

			return {
				response: metadataMutationResponse,
			};
		}
	};

	return {
		importProgramStage: handleImportProgramStage,
		loading,
		error,
	};
}
