import React from "react";
import AdherenceStreak, {
	DateEvent,
} from "../../../../shared/components/AdherenceStreak/AdherenceStreak";
import {
	useAdherenceEvents,
	useDeviceData,
} from "../../../../shared/components/ProfileArea/utils";
import { useSetting } from "@dhis2/app-service-datastore";
import { useSearchParams } from "react-router-dom";
import { getProgramMapping } from "../../../../shared/utils";
import { DateTime } from "luxon";
import { PatientProfile } from "../../../../shared/models";
import { CircularLoader } from "@dhis2/ui";

export function GetAdherenceStreak({ patient }: { patient: PatientProfile }) {
	const { data, loadingDevice } = useDeviceData(patient?.deviceIMEINumber);
	const [programMapping] = useSetting("programMapping", {
		global: true,
	});

	const [params] = useSearchParams();
	const currentProgram = params.get("program");

	const program = getProgramMapping(programMapping, currentProgram);

	const { filteredEvents } = useAdherenceEvents(
		patient?.events ?? [],
		program?.programStage ?? "",
	);

	const enrollmentDate = DateTime.fromFormat(
		data?.enrollmentDate ?? "",
		"yyyy-MM-dd HH:mm:ss",
	).toISO();

	filteredEvents.push({
		dataValues: [
			{
				value: "DeviceEnrollmentDate",
			},
		],
		occurredAt: [
			{
				value: enrollmentDate,
			},
		],
		batteryLevel: [],
	});

	const adherenceEvents = (filteredEvents ?? []).map((item: any) => {
		return {
			date: item.occurredAt[0].value,
			event:
				item.dataValues[0].value == "Once"
					? "takenDose"
					: item.dataValues[0].value == "Multiple"
					? "takenDose"
					: item.dataValues[0].value == "Heartbeat"
					? "notTakenDose"
					: item.dataValues[0].value == "DeviceEnrollmentDate"
					? "enrolled"
					: item.dataValues[0].value == "None"
					? ""
					: "",
		};
	});
	const events: DateEvent[] = [...adherenceEvents];

	return loadingDevice ? (
		<CircularLoader small />
	) : (
		<div style={{ width: "120px" }}>
			<AdherenceStreak
				events={events}
				frequency={patient?.adherenceFrequency ?? ""}
			/>
		</div>
	);
}

export function GetAdherenceStreakForReport({
	events,
	frequency,
	device,
}: {
	events: any;
	frequency: string;
	device: string;
}) {
	const { data, loadingDevice } = useDeviceData(device);

	const enrollmentDate = DateTime.fromFormat(
		data?.enrollmentDate ?? "",
		"yyyy-MM-dd HH:mm:ss",
	).toISO();

	events.push({
		event: "enrolled",
		date: enrollmentDate,
	});

	return loadingDevice ? (
		<CircularLoader small />
	) : (
		<div style={{ width: "120px" }}>
			<AdherenceStreak events={events} frequency={frequency ?? ""} />
		</div>
	);
}
