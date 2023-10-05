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

const ActualPatientState = atomFamily<TrackedEntity | null, string | undefined>(
	{
		key: "patientState",
		default: null as PatientProfile | null,
	}
);

export function usePatient() {
	const { id } = useParams();
	const patientState = useRecoilValueLoadable(PatientState(id));
	const [patientTei, setPatient] = useRecoilState<TrackedEntity | null>(
		ActualPatientState(id)
	);
	const refresh = useRecoilCallback(
		({ refresh }) =>
			() =>
				refresh(PatientState(id))
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
			return new PatientProfile(patientTei);
		}
	}, [patientTei]);

	return {
		patient,
		error,
		loading,
		refresh,
	};
}
