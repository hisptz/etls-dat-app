import { useDataMutation } from "@dhis2/app-runtime";
import { useSetting } from "@dhis2/app-service-datastore";
import { useSearchParams } from "react-router-dom";
import { DATA_ELEMENTS, programMapping } from "../../../../shared/constants";

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

	const programMapping: programMapping = {
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
	const [params] = useSearchParams();
	const programId = params.get("mappedTbProgram");
	const [programMapping] = useSetting("programMapping", { global: true });

	const programStage = {
		programStages: [
			{
				id: programMapping.programStage,
				name: "DAT-Adherence Records",
				repeatable: true,
				program: { id: programId ?? programMapping.program ?? null },
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
				code: "WISE_PILL_001",
				id: DATA_ELEMENTS.DEVICE_HEALTH,
				name: "Device health",
				shortName: "Device health",
				aggregationType: "NONE",
				domainType: "TRACKER",
				valueType: "TEXT",
			},
			{
				code: "WISE_PILL_002",
				id: DATA_ELEMENTS.BATTERY_HEALTH,
				name: "Battery health",
				shortName: "Battery health",
				aggregationType: "NONE",
				domainType: "TRACKER",
				valueType: "NUMBER",
			},
			{
				code: "WISE_PILL_003",
				id: DATA_ELEMENTS.DOSAGE_TIME,
				name: "Dosage time",
				shortName: "Dosage time",
				aggregationType: "NONE",
				domainType: "TRACKER",
				valueType: "DATETIME",
			},
			{
				code: "WISE_PILL_004",
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
		],
	};

	const createProgramStage: any = {
		type: "create",
		resource: "metadata",
		data: programStage,
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

	const [mutate, { loading, error }] = useDataMutation(createProgramStage);

	const handleImportProgramStage = () => {
		mutate()
			.then((response) => {
				null;
			})
			.catch((error) => {
				null;
			});
	};

	return {
		importProgramStage: handleImportProgramStage,
		loading,
		error,
	};
}
