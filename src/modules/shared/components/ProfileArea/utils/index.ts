import { useSetting } from "@dhis2/app-service-datastore";
import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { DATA_ELEMENTS } from "../../../constants";
import { useSearchParams } from "react-router-dom";
import { getProgramMapping } from "../../../utils";
import { isEmpty } from "lodash";

export const useDeviceData = (imei?: string) => {
	const [programMapping] = useSetting("programMapping", { global: true });
	const [data, setData] = useState<any>();
	const [errorDevice, setError] = useState<any>();
	const [loadingDevice, setLoading] = useState(true);
	const [params] = useSearchParams();
	const currentProgram = params.get("program");

	const program = getProgramMapping(programMapping, currentProgram);
	const MediatorUrl = program?.mediatorUrl;
	const ApiKey = program?.apiKey;

	const fetchData = useCallback(
		async (imei?: string) => {
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
		},
		[MediatorUrl, ApiKey, imei, currentProgram],
	);

	const refetch = useCallback(() => {
		setLoading(true);
		fetchData(imei);
	}, [fetchData, currentProgram]);

	useEffect(() => {
		if (imei !== "N/A") {
			fetchData(imei);
		} else {
			setLoading(false);
		}
	}, [imei, fetchData, currentProgram]);

	return { data, errorDevice, loadingDevice, refetchDevice: refetch };
};

export const useAdherenceEvents = (data: any, programStage: string) => {
	const filteredEvents = data
		.filter((event: any) => event.programStage === programStage)
		.map((event: any) => {
			const dosageTimeFromDOSAGE_TIME = event.dataValues.filter(
				(value: any) => value.dataElement === DATA_ELEMENTS.DOSAGE_TIME,
			);

			const dosageTimeFromDEVICE_SIGNAL = event.dataValues
				.filter(
					(value: any) =>
						value.dataElement === DATA_ELEMENTS.DEVICE_SIGNAL,
				)
				.map((item: any) => ({
					...item,
					value: item.createdAt,
				}));

			const dosageTime = !isEmpty(dosageTimeFromDOSAGE_TIME)
				? dosageTimeFromDOSAGE_TIME
				: dosageTimeFromDEVICE_SIGNAL;

			return {
				dataValues: event.dataValues.filter(
					(value: any) =>
						value.dataElement === DATA_ELEMENTS.DEVICE_SIGNAL,
				),
				occurredAt: dosageTime,
				batteryLevel: event.dataValues.filter(
					(value: any) =>
						value.dataElement === DATA_ELEMENTS.BATTERY_HEALTH,
				),
			};
		});

	return { filteredEvents };
};

export const useActualCurrentDate = () => {
	const [date, setDate] = useState<Date | null>(null);
	const [error, setError] = useState<any>(null);

	const fetchActualDate = async () => {
		try {
			const response = await fetch("http://worldtimeapi.org/api/ip");
			if (!response.ok) throw new Error("Failed to fetch date");
			const data = await response.json();
			setDate(new Date(data.datetime));
		} catch (error) {
			console.error("Error fetching actual date:", error);
			setDate(new Date());
			setError(error);
		}
	};

	useEffect(() => {
		fetchActualDate();
	}, []);

	return { date, error };
};
