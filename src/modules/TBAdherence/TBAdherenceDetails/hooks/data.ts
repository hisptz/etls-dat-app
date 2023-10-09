import { useParams } from "react-router";
import {
	atomFamily,
	useRecoilCallback,
	useRecoilState,
	useRecoilValueLoadable,
} from "recoil";
import { PatientState } from "../state/data";
import { useEffect, useMemo } from "react";
import { PatientProfile } from "../../../shared/models";
import { TrackedEntity } from "../../../shared/types";
import { useSetting } from "@dhis2/app-service-datastore";

const ActualPatientState = atomFamily<TrackedEntity | null, string | undefined>(
	{
		key: "patientState",
		default: null as PatientProfile | null,
	},
);

export function usePatient() {
	const { id } = useParams();
	const [programMapping] = useSetting("programMapping", {
		global: true,
	});

	const program = programMapping.program;
	const patientState = useRecoilValueLoadable(
		PatientState({ id: id, program: program }),
	);

	const [patientTei, setPatient] = useRecoilState<TrackedEntity | null>(
		ActualPatientState(id),
	);
	const refresh = useRecoilCallback(
		({ refresh }) =>
			() =>
				refresh(PatientState({ id: id, program: program })),
	);
	const loading = patientState.state === "loading";
	const error =
		patientState.state === "hasError" ? patientState.contents : null;

	useEffect(() => {
		if (patientState.state == "hasValue") {
			setPatient(patientState.contents as TrackedEntity);
		}
	}, [patientState.state]);

	const patient = useMemo(() => {
		if (patientTei) {
			return new PatientProfile(patientTei, programMapping);
		}
	}, [patientTei]);

	return {
		patient,
		error,
		loading,
		refresh,
	};
}
