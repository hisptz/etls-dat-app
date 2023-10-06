import { useSearchParams } from "react-router-dom";

export function useProgramMapping() {
	const [params, setParams] = useSearchParams();
	const programId = params.get("mapped-tb-program");
	const mediatorurl = params.get("mediatorurl");
	const apiKey = params.get("apiKey");
	const firstname = params.get("firstName");
	const surname = params.get("surname");
	const tbIdentificationNumber = params.get("tb-identification-number");
	const dateOfBirth = params.get("dateOfBirth");
	const sex = params.get("sex");
	const adherenceFrequency = params.get("adherenceFrequency");
	const phoneNumber = params.get("phoneNumber");
	const deviceIMEInumber = params.get("deviceIMEInumber");

	const programMapping = {
		program: programId,
		mediatorurl: mediatorurl,
		apiKey: apiKey,
		attributes: {
			firstname: firstname,
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
