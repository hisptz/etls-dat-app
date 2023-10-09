import { useDataMutation } from "@dhis2/app-runtime";
import { useSetting } from "@dhis2/app-service-datastore";
import { useSearchParams } from "react-router-dom";
import { programMapping } from "../../../../shared/constants";

export function useProgramMapping() {
	const [params] = useSearchParams();
	const programId = params.get("mappedTbProgram");
	const mediatorUrl = params.get("mediatorUrl");
	const apiKey = params.get("apiKey");
	const firstName = params.get("firstName");
	const surname = params.get("surname");
	const tbIdentificationNumber = params.get("tbIdentificationNumber");
	const dateOfBirth = params.get("dateOfBirth");
	const sex = params.get("sex");
	const adherenceFrequency = params.get("adherenceFrequency");
	const phoneNumber = params.get("phoneNumber");
	const deviceIMEInumber = params.get("deviceIMEInumber");

	const programMapping: programMapping = {
		program: programId ?? "",
		mediatorUrl: mediatorUrl ?? "",
		apiKey: apiKey ?? "",
		attributes: {
			firstName: firstName ?? "",
			surname: surname ?? "",
			tbIdentificationNumber: tbIdentificationNumber ?? "",
			dateOfBirth: dateOfBirth ?? "",
			sex: sex ?? "",
			adherenceFrequency: adherenceFrequency ?? "",
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
		tbIdentificationNumber:
			programMapping.attributes?.tbIdentificationNumber ?? "",
		dateOfBirth: programMapping.attributes?.dateOfBirth ?? "",
		sex: programMapping.attributes?.sex ?? "",
		adherenceFrequency: programMapping.attributes?.adherenceFrequency ?? "",
		phoneNumber: programMapping.attributes?.phoneNumber ?? "",
		deviceIMEInumber: programMapping.attributes?.deviceIMEInumber ?? "",
	});
}

export function useProgramStage() {
	const [params] = useSearchParams();
	const programId = params.get("mappedTbProgram");
	const [programMapping] = useSetting("programMapping", { global: true });
	const [programStageID] = useSetting("programStage", { global: true });

	const programStage = {
		programStages: [
			{
				id: programStageID ?? "",
				name: "Test Program stage",
				program: { id: programId ?? programMapping.program },
				programStageDataElements: [
					{
						dataElement: { id: "Vc6c6OjvvHO" },
					},
					{
						dataElement: { id: "QH0OjHcBBpO" },
					},
					{
						dataElement: { id: "FOHv6pUjBjv" },
					},
				],
			},
		],
		dataElements: [
			{
				code: "WISE_PILL_001",
				id: "QH0OjHcBBpO",
				name: "Device health",
				shortName: "Device health",
				aggregationType: "NONE",
				domainType: "TRACKER",
				valueType: "NUMBER",
			},
			{
				code: "WISE_PILL_002",
				id: "Vc6c6OjvvHO",
				name: "Battery health",
				shortName: "Battery health",
				aggregationType: "NONE",
				domainType: "TRACKER",
				valueType: "NUMBER",
			},
			{
				code: "WISE_PILL_003",
				id: "FOHv6pUjBjv",
				name: "Dosage time",
				shortName: "Dosage time",
				aggregationType: "NONE",
				domainType: "TRACKER",
				valueType: "NUMBER",
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

	const handleCreateMetadata = () => {
		mutate()
			.then((response) => {
				console.log("Metadata created:", response);
			})
			.catch((error) => {
				console.error("Error creating metadata:", error);
			});
	};

	return {
		createProgramStage: handleCreateMetadata,
		loading,
		error,
	};
}
