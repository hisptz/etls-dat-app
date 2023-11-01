import axios from "axios";
import { useState, useEffect } from "react";

export const useDeviceData = (imei: string) => {
	const [data, setData] = useState<any>();
	const [error, setError] = useState<any>();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axios.get(
					"https://dev.hisptz.com/dhis2etl/server/api/devices/",
					{
						headers: {
							"x-api-key": "ImASecret",
						},
					},
				);
				setData(response);
				setLoading(false);
			} catch (error) {
				setError(error);
				setLoading(false);
			}
		};

		fetchData();
	}, [loading]);

	return { data, error, loading };
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
