import { useAlert, useDataMutation } from "@dhis2/app-runtime";
import { useSetting } from "@dhis2/app-service-datastore";
import { useSearchParams } from "react-router-dom";

import { usePatient } from "../../../TBAdherence/TBAdherenceDetails/hooks/data";
import { useEffect, useState } from "react";

export function useAssignDevice() {
	const [programMapping] = useSetting("programMapping", { global: true });
	const { patientTei, loading } = usePatient();
	const TEA_ID = programMapping.attributes.deviceIMEInumber;

	const attributeIndex = patientTei?.attributes.findIndex(
		(attribute) => attribute.attribute === TEA_ID,
	);

	const { trackedEntity, trackedEntityType, orgUnit } = patientTei;

	const newDevice: any = {
		type: "create",
		resource: "tracker",
		data: ({ data }: any) => data,
		async: false,
	};
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);
	const [update, { error }] = useDataMutation(newDevice, {
		onError: (error) => {
			show({
				message: `Could not update: ${error.message}`,
				type: { info: true },
			});
		},
		onComplete: () => {
			show({ message: "Update successful", type: { success: true } });
		},
	});

	const handleAssignDevice = async (data: string) => {
		const updatedAttributes =
			attributeIndex === -1
				? [
						...patientTei!.attributes,
						{
							attribute: TEA_ID,
							value: data,
						},
				  ]
				: patientTei!.attributes.map((attribute, index) =>
						index === attributeIndex
							? { ...attribute, value: data }
							: attribute,
				  );
		const updatedTei = {
			attributes: updatedAttributes,
			trackedEntity,
			trackedEntityType,
			orgUnit,
		};

		await update({
			data: { trackedEntities: [updatedTei] },
		});
	};

	return {
		assignDevice: handleAssignDevice,
		loading,
		error,
	};
}
