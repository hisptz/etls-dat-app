import { useSetting } from "@dhis2/app-service-datastore";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

export function useSetAlarm() {
	const [programMapping] = useSetting("programMapping", { global: true });

	const [params] = useSearchParams();
	const currentProgram = params.get("program");

	const selectedProgram = programMapping.filter(
		(mapping: any) => mapping.program === currentProgram,
	);
	const program = selectedProgram[0];
	const MediatorUrl = program?.mediatorUrl;
	const ApiKey = program?.apiKey;

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
