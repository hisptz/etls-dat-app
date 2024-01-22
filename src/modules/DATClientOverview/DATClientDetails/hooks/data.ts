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
import { useSearchParams } from "react-router-dom";
import { getProgramMapping } from "../../../shared/utils";

const ActualPatientState = atomFamily<TrackedEntity | null, string | undefined>(
	{
		key: "patientState",
		default: null as PatientProfile | null,
	},
);

export function usePatient(id2?: string) {
	const { id } = useParams();
	const [programMapping] = useSetting("programMapping", {
		global: true,
	});
	const [regimenSetting] = useSetting("regimenSetting", {
		global: true,
	});

	const [params] = useSearchParams();
	const currentProgram = params.get("program");

	const program = getProgramMapping(programMapping, currentProgram);

	const patientState = useRecoilValueLoadable(
		PatientState({ id: id ?? id2, program: program?.program ?? "" }),
	);

	const [patientTei, setPatient] = useRecoilState<TrackedEntity | null>(
		ActualPatientState(id ?? id2),
	);
	const refresh = useRecoilCallback(
		({ refresh }) =>
			() =>
				refresh(
					PatientState({
						id: id ?? id2,
						program: program?.program ?? "",
					}),
				),
	);
	const loading = patientState.state === "loading";
	const error =
		patientState.state === "hasError" ? patientState.contents : null;

	useEffect(() => {
		if (patientState.state == "hasValue") {
			setPatient(patientState.contents as TrackedEntity);
		}
	}, [patientState.state, currentProgram]);

	const patient = useMemo(() => {
		if (patientTei) {
			return new PatientProfile(
				patientTei,
				program ?? {},
				regimenSetting,
			);
		}
	}, [patientTei, currentProgram]);

	return {
		patient,
		patientTei,
		error,
		loading,
		refresh,
	};
}
