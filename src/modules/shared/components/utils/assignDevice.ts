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

	const TEA_ID = TRACKED_ENTITY_ATTRIBUTES.DEVICE_IMEI;
	const EPISODE_ID = TRACKED_ENTITY_ATTRIBUTES.EPISODE_ID;
	const MediatorUrl = program?.mediatorUrl;
	const ApiKey = program?.apiKey;

	const attributeIndex = patientTei?.attributes.findIndex(
		(attribute) => attribute.attribute === TEA_ID,
	);

	const { trackedEntity, trackedEntityType, orgUnit } =
		patientTei as TrackedEntity;

	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	const trackedEntityAttributesMutation: any = {
		type: "create",
		resource: "tracker",
		params: {
			async: false,
		},
		data: ({ data }: any) => data,
		async: false,
	};

	const [update] = useDataMutation(trackedEntityAttributesMutation, {
		onError: (error) => {
			show({
				message: `Could not update: ${error}`,
				type: { info: true },
			});
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
						// {
						// 	attribute: EPISODE_ID,
						// 	value: episodeID,
						// },
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
			const res = await update({
				data: { trackedEntities: [updatedTei] },
			});

			return {
				updated:
					res?.bundleReport.typeReportMap.TRACKED_ENTITY.stats
						.updated,

				ignored:
					res?.bundleReport.typeReportMap.TRACKED_ENTITY.stats
						.ignored,

				error: res?.bundleReport.typeReportMap.TRACKED_ENTITY
					.objectReports[0].errorReports,
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
