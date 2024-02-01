import React from "react";
import { Chip } from "@dhis2/ui";
import { useSetting } from "@dhis2/app-service-datastore";
import { useSearchParams } from "react-router-dom";
import { head, orderBy } from "lodash";
import { DATA_TEST_PREFIX } from "../../../shared/constants";

function ProgramChips() {
	const [programMapping] = useSetting("programMapping", { global: true });
	const [params, setParams] = useSearchParams();

	const program: string =
		params.get("program") ??
		(head(orderBy(programMapping, "name")) as any)?.program ??
		"";

	return (
		<div style={{ display: "flex" }}>
			{orderBy(programMapping, "name").map((mapping: any) => {
				return (
					<Chip
						selected={program == mapping.program ? true : false}
						onClick={() => {
							setParams((params) => {
								const updatedParams = new URLSearchParams(
									params,
								);
								updatedParams.set("program", mapping.program);

								return updatedParams;
							});
						}}
						dataTest={`${DATA_TEST_PREFIX}-${mapping.name}-tab-item`}
						key={`${mapping.name}-tab-item`}
					>
						{mapping.name}
					</Chip>
				);
			})}
		</div>
	);
}

export default ProgramChips;
