import { useSetting } from "@dhis2/app-service-datastore";
import axios from "axios";
import { useState, useEffect } from "react";

export const useDeviceData = (imei?: string) => {
	const [programMapping] = useSetting("programMapping", { global: true });
	const [data, setData] = useState<any>();
	const [errorDevice, setError] = useState<any>();
	const [loadingDevice, setLoading] = useState(true);
	const MediatorUrl = programMapping.mediatorUrl;
	const ApiKey = programMapping.apiKey;

	useEffect(() => {
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

		if (imei) {
			fetchData();
		}
	}, [imei]);

	return { data, errorDevice, loadingDevice };
};

export const useAdherenceEvents = (data: any, desiredEvent: string) => {
	const filteredEvents = data
		.filter((event: any) => event.event === desiredEvent)
		.map((event: any) => ({
			dataValues: event.dataValues,
			occurredAt: event.occurredAt,
		}));

	return { filteredEvents };
};
