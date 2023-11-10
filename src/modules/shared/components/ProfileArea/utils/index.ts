import { useSetting } from "@dhis2/app-service-datastore";
import axios from "axios";
import { useState, useEffect } from "react";
import { DATA_ELEMENTS } from "../../../constants";

export const useDeviceData = (imei?: string) => {
	const [programMapping] = useSetting("programMapping", { global: true });
	const [data, setData] = useState<any>();
	const [errorDevice, setError] = useState<any>();
	const [loadingDevice, setLoading] = useState(true);
	const MediatorUrl = programMapping.mediatorUrl;
	const ApiKey = programMapping.apiKey;

	useEffect(() => {
		if (imei != "N/A") {
			const fetchData = async () => {
				try {
					const response = await axios.get(
						`${MediatorUrl}/api/devices/details?imei=${imei}`,
						{
							headers: {
								"x-api-key": ApiKey,
							},
						},
					);
					setData(response.data);

					setLoading(false);
				} catch (error) {
					setError(error);

					setLoading(false);
				}
			};

			fetchData();
		} else {
			setLoading(false);
		}
	}, [imei]);

	return { data, errorDevice, loadingDevice };
};

export const useAdherenceEvents = (data: any, programStage: string) => {
	const filteredEvents = data
		.filter((event: any) => event.programStage === programStage)
		.map((event: any) => ({
			dataValues: event.dataValues.filter(
				(value: any) =>
					value.dataElement === DATA_ELEMENTS.DEVICE_SIGNAL,
			),
			occurredAt: event.dataValues.filter(
				(value: any) => value.dataElement === DATA_ELEMENTS.DOSAGE_TIME,
			),
		}));

	return { filteredEvents };
};
