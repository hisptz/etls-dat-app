import axios from "axios";
import { useState, useEffect } from "react";

export const useDeviceData = (imei: string) => {
	const [data, setData] = useState<any>();
	const [errorDevice, setError] = useState<any>();
	const [loadingDevice, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axios.get(
					`https://dev.hisptz.com/dhis2etl/server/api/devices/details?imei=${imei}`,
					{
						headers: {
							"x-api-key": "ImASecret",
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
	}, [loadingDevice]);

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
