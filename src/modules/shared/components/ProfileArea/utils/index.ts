import { useSetting } from "@dhis2/app-service-datastore";
import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { DATA_ELEMENTS } from "../../../constants";

export const useDeviceData = (imei?: string) => {
	const [programMapping] = useSetting("programMapping", { global: true });
	const [data, setData] = useState<any>();
	const [errorDevice, setError] = useState<any>();
	const [loadingDevice, setLoading] = useState(true);
	const MediatorUrl = programMapping.mediatorUrl;
	const ApiKey = programMapping.apiKey;

	const fetchData = useCallback(async () => {
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
	}, [MediatorUrl, ApiKey, imei]);

	const refetch = useCallback(() => {
		setLoading(true);
		fetchData();
	}, [fetchData]);

	useEffect(() => {
		if (imei !== "N/A") {
			fetchData();
		} else {
			setLoading(false);
		}
	}, [imei, fetchData]);

	return { data, errorDevice, loadingDevice, refetchDevice: refetch };
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
