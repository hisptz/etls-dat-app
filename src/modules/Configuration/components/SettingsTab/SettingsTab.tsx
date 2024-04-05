import React from "react";
import { Tab, TabBar } from "@dhis2/ui";
import { ROUTES } from "../../../Routes/constants/nav";
import { find } from "lodash";

import { useMatches, useNavigate } from "react-router-dom";
import { DATA_TEST_PREFIX } from "../../../shared/constants";

export function SettingsTab() {
	const matches = useMatches();
	const navigate = useNavigate();
	const configuration =
		find(ROUTES, { id: "configuration" })?.subItems?.filter(
			({ path }) => path !== "",
		) ?? [];

	return (
		<TabBar>
			{configuration.map(({ path, label }) => {
				return (
					<Tab
						selected={matches.some((match) =>
							match.pathname.match(path),
						)}
						onClick={() => navigate(path)}
						dataTest={`${DATA_TEST_PREFIX}-${path}-tab-item`}
						key={`${path}-tab-item`}
					>
						{label}
					</Tab>
				);
			})}
		</TabBar>
	);
}
