import { useSetting } from "@dhis2/app-service-datastore";
import { useSearchParams } from "react-router-dom";

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

	const programMapping = {
		program: programId,
		mediatorUrl: mediatorUrl,
		apiKey: apiKey,
		attributes: {
			firstName: firstName,
			surname: surname,
			tbIdentificationNumber: tbIdentificationNumber,
			dateOfBirth: dateOfBirth,
			sex: sex,
			adherenceFrequency: adherenceFrequency,
			phoneNumber: phoneNumber,
			deviceIMEInumber: deviceIMEInumber,
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
