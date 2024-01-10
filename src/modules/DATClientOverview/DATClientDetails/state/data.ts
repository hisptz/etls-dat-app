import { selectorFamily } from "recoil";
import { head } from "lodash";
import i18n from "@dhis2/d2-i18n";
import { TEI_FIELDS } from "../../../shared/constants";
import { TrackedEntity } from "../../../shared/types";
import { DataEngineState } from "../../../shared/state";

const query: any = {
	patient: {
		resource: "tracker/trackedEntities",
		params: ({ id, program }: { id: string; program: string }) => ({
			trackedEntity: id,
			ouMode: "ACCESSIBLE",
			program: program,
			fields: TEI_FIELDS,
		}),
	},
};

export const PatientState = selectorFamily<
	TrackedEntity,
	{ id?: string; program: string }
>({
	key: "patient-state",
	get:
		({ id, program }) =>
		async ({ get }) => {
			if (!id) {
				throw Error(i18n.t("Instance ID is required"));
			}
			const engine = get(DataEngineState);
			const response = await engine.query(query, {
				variables: {
					id,
					program,
				},
			});

			const trackedEntity = head((response?.patient as any)?.instances);

			if (!trackedEntity) {
				throw Error(
					i18n.t(
						"Patient with Instance ID {{id}} could not be found",
						{
							id,
						},
					),
				);
			}

			return trackedEntity;
		},
});
