import React from "react";
import AdherenceStreak, {
	DateEvent,
} from "../../../../shared/components/AdherenceStreak/AdherenceStreak";
import { useAdherenceEvents } from "../../../../shared/components/ProfileArea/utils";
import { usePatient } from "../../../../DATClientOverview/DATClientDetails/hooks/data";
import { useSetting } from "@dhis2/app-service-datastore";
import { useSearchParams } from "react-router-dom";
import { getProgramMapping } from "../../../../shared/utils";

function GetAdherenceStreak({ teiID }: { teiID: string }) {
	const [programMapping] = useSetting("programMapping", {
		global: true,
	});

	const [params] = useSearchParams();
	const currentProgram = params.get("program");

	const program = getProgramMapping(programMapping, currentProgram);
	const { patient } = usePatient(teiID);
	const { filteredEvents } = useAdherenceEvents(
		patient?.events ?? [],
		program?.programStage ?? "",
	);

	const adherenceEvents = filteredEvents.map((item: any) => {
		return {
			date: item.occurredAt[0].value,
			event:
				item.dataValues[0].value == "Once"
					? "takenDose"
					: item.dataValues[0].value == "Multiple"
					? "takenDose"
					: item.dataValues[0].value == "Heartbeat"
					? "notTakenDose"
					: item.dataValues[0].value == "Enrollment"
					? "enrolled"
					: item.dataValues[0].value == "None"
					? ""
					: "",
		};
	});
	const events: DateEvent[] = [...adherenceEvents];

	return (
		<div style={{ width: "120px" }}>
			<AdherenceStreak
				events={events}
				frequency={patient?.adherenceFrequency ?? ""}
			/>
		</div>
	);
}

export default GetAdherenceStreak;
