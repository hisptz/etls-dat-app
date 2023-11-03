import { useAlert, useDataMutation } from "@dhis2/app-runtime";
import { useSetting } from "@dhis2/app-service-datastore";
import axios from "axios";
import { usePatient } from "../../../TBAdherence/TBAdherenceDetails/hooks/data";
import { TrackedEntity } from "../../types";

export function useAssignDevice() {
	const [programMapping] = useSetting("programMapping", { global: true });
	const { patientTei } = usePatient();
	const TEA_ID = programMapping.attributes.deviceIMEInumber;
	const MediatorUrl = programMapping.mediatorUrl;
	const ApiKey = programMapping.apiKey;

	const attributeIndex = patientTei?.attributes.findIndex(
		(attribute) => attribute.attribute === TEA_ID,
	);

	const { trackedEntity, trackedEntityType, orgUnit } =
		patientTei as TrackedEntity;

	const trackedEntityAttributesMutation: any = {
		type: "create",
		resource: "tracker",
		params: {
			async: false,
		},
		data: ({ data }: any) => data,
		async: false,
	};
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);
	const [update] = useDataMutation(trackedEntityAttributesMutation, {
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

		if (data) {
			await update({
				data: { trackedEntities: [updatedTei] },
			});
		}
	};

	const handleAssignDeviceToWisepill = async ({
		imei,
		patientId,
	}: {
		imei: string;
		patientId: string;
	}) => {
		let loading = true;
		try {
			const data = {
				imei: imei,
				patientId: patientId,
			};
			const response = await axios.post(
				`${MediatorUrl}/api/devices/assign`,
				data,
				{
					headers: {
						"x-api-key": ApiKey,
					},
				},
			);
			loading = false;

			return { response: response, error: null, loading };
		} catch (error) {
			loading = false;
			return { response: null, error, loading };
		}
	};

	return {
		assignDevice: handleAssignDevice,
		assignDeviceWisePill: handleAssignDeviceToWisepill,
	};
}
