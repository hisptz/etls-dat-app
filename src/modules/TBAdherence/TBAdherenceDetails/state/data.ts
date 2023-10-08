import { selectorFamily } from "recoil";
import { head } from "lodash";
import i18n from "@dhis2/d2-i18n";
import { DAT_PROGRAM, TEI_FIELDS } from "../../../shared/constants";
import { TrackedEntity } from "../../../shared/types";
import { DataEngineState } from "../../../shared/state";

const query: any = {
	traveler: {
		resource: "tracker/trackedEntities",
		params: ({ id }: { id: string }) => ({
			trackedEntity: id,
			ouMode: "ACCESSIBLE",
			program: "tj4u1ip0tTF",
			fields: TEI_FIELDS,
		}),
	},
};

export const PatientState = selectorFamily<TrackedEntity, string | undefined>({
	key: "patient-state",
	get:
		(id?: string) =>
		async ({ get }) => {
			if (!id) {
				throw Error(i18n.t("Instance ID is required"));
			}

			const engine = get(DataEngineState);
			const response = await engine.query(query, {
				variables: {
					id,
				},
			});
			const trackedEntity = head((response?.traveler as any)?.instances);

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
