import { useDataMutation } from "@dhis2/app-runtime";
import { useSetting } from "@dhis2/app-service-datastore";
import { useSearchParams } from "react-router-dom";

import { usePatient } from "../../../TBAdherence/TBAdherenceDetails/hooks/data";
import { useEffect, useState } from "react";

export function useAssignDevice() {
	const [programMapping] = useSetting("programMapping", { global: true });
	const { patientTei, loading } = usePatient();
	const TEA_ID = programMapping.attributes.deviceIMEInumber;
	const [params] = useSearchParams();
	const [newValue, setNewValue] = useState<string | null>();

	useEffect(() => {
		setNewValue(params.get("deviceEMInumber"));
	}, [params.get("deviceEMInumber")]);

	const attributeIndex = patientTei?.attributes.findIndex(
		(attribute) => attribute.attribute === TEA_ID,
	);

	const { enrollments, ...updatedTeiWithoutEnrollments } = patientTei;

	const updatedAttributes =
		attributeIndex === -1
			? [
					...patientTei!.attributes,
					{
						attribute: TEA_ID,
						value: newValue,
					},
			  ]
			: patientTei!.attributes.map((attribute, index) =>
					index === attributeIndex
						? { ...attribute, value: newValue }
						: attribute,
			  );

	const updatedTei = {
		...enrollments[0],
		attributes: updatedAttributes,
	};

	delete updatedTei.events;
	delete updatedTei.relationships;
	delete updatedTei.followUp;

	console.log({
		enrollments: [updatedTei],
	});

	const newDevice: any = {
		type: "create",
		resource: "tracker",
		data: {
			enrollments: [updatedTei],
		},
		importStrategy: "CREATE_AND_UPDATE",
		async: true,
	};

	const [mutate, { error }] = useDataMutation(newDevice);

	const handleAssignDevice = () => {
		mutate()
			.then((response) => {
				console.log(response);
			})
			.catch((error) => {
				console.log(error);
			});
	};

	return {
		assignDevice: handleAssignDevice,
		loading,
		error,
	};
}
