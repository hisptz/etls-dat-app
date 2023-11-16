import { useSetting } from "@dhis2/app-service-datastore";
import axios from "axios";

export function useSetAlarm() {
	const [programMapping] = useSetting("programMapping", { global: true });
	const MediatorUrl = programMapping.mediatorUrl;
	const ApiKey = programMapping.apiKey;

	const handleSetAlarm = async ({
		data,
	}: {
		data: {
			imei: string;
			alarm: string | null;
			refillAlarm: string;
			days: string | null;
		};
	}) => {
		let loading = true;
		try {
			const response = await axios.post(
				`${MediatorUrl}/api/alarms`,
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

	return { setAlarm: handleSetAlarm };
}
