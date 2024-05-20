import { useAlert, useDataMutation } from "@dhis2/app-runtime";
import { useSetting } from "@dhis2/app-service-datastore";
import axios from "axios";
import { usePatient } from "../../../DATClientOverview/DATClientDetails/hooks/data";
import { TrackedEntity } from "../../types";
import { useSearchParams } from "react-router-dom";
import { DATA_ELEMENTS, TRACKED_ENTITY_ATTRIBUTES } from "../../constants";
import { getProgramMapping } from "../../utils";

export function useAssignDevice() {
	const [programMapping] = useSetting("programMapping", { global: true });
	const { patientTei } = usePatient();

	const [params] = useSearchParams();
	const currentProgram = params.get("program");

	const program = getProgramMapping(programMapping, currentProgram);

	const DEVICE_IMEI = TRACKED_ENTITY_ATTRIBUTES.DEVICE_IMEI;
	const EPISODE_ID = TRACKED_ENTITY_ATTRIBUTES.EPISODE_ID;
	const MediatorUrl = program?.mediatorUrl;
	const ApiKey = program?.apiKey;

	const attributeIndex = patientTei?.attributes.findIndex(
		(attribute) => attribute.attribute === DEVICE_IMEI,
	);

	const attributeEpisodeIndex = patientTei?.attributes.findIndex(
		(attribute) => attribute.attribute === EPISODE_ID,
	);

	const { trackedEntityInstance, orgUnit } = patientTei as TrackedEntity;

	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	const trackedEntityAttributesMutation: any = {
		type: "create",
		resource: "trackedEntityInstances",
		params: {
			strategy: "CREATE_AND_UPDATE",
		},
		data: ({ data }: any) => data,
	};

	const [update] = useDataMutation(trackedEntityAttributesMutation, {
		onError: (error) => {
			show({
				message: `Could not update: ${error}`,
				type: { critical: true },
			});
		},
	});

	const handleAssignDevice = async ({
		data,
		episodeID,
	}: {
		data: string;
		episodeID: string;
	}) => {
		const updatedAttributes =
			attributeIndex === -1 || attributeEpisodeIndex === -1
				? [
						...patientTei!.attributes,
						{
							attribute: DEVICE_IMEI,
							value: data,
						},
						{
							attribute: EPISODE_ID,
							value: episodeID,
						},
				  ]
				: patientTei!.attributes.map((attribute, index) =>
						index === attributeIndex
							? { ...attribute, value: data }
							: index === attributeEpisodeIndex
							? { ...attribute, value: episodeID }
							: attribute,
				  );
		const updatedTei = {
			attributes: updatedAttributes,
			trackedEntityInstance,
			orgUnit,
		};

		if (data) {
			const res = await update({
				data: { trackedEntityInstances: [updatedTei] },
			});

			return {
				updated: res?.response.importSummaries[0].importCount.updated,

				ignored: res?.response.importSummaries[0].importCount.ignored,

				error: res?.response.importSummaries[0].conflicts,
			};
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

			return {
				response: response,
				error: null,
				loading,
			};
		} catch (error: any) {
			loading = false;
			return { response: null, error, loading };
		}
	};

	return {
		assignDevice: handleAssignDevice,
		assignDeviceWisePill: handleAssignDeviceToWisepill,
	};
}
