import React from "react";
import { head, orderBy } from "lodash";
import { Tab, TabBar } from "@dhis2/ui";
import { useSearchParams } from "react-router-dom";
import { DATA_TEST_PREFIX } from "../../../shared/constants";
import { useSetting } from "@dhis2/app-service-datastore";

export function ProgramsTab() {
	const [programMapping] = useSetting("programMapping", { global: true });
	const [params, setParams] = useSearchParams();

	const program: string =
		params.get("program") ?? (head(programMapping) as any)?.program ?? "";

	return (
		<TabBar>
			{orderBy(programMapping, "name").map((mapping: any) => {
				return (
					<Tab
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
					</Tab>
				);
			})}
		</TabBar>
	);
}
