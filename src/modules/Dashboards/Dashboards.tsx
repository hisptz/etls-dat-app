import React from "react";
import i18n from "@dhis2/d2-i18n";

import { DATA_TEST_PREFIX } from "../shared/constants";
import DashboardHeader from "./components/DashboardHeader";
import DashboardContainer from "./components/DashboardContainer";

export function Dashboards() {
	return (
		<div
			className="column gap-32 p-16 h-100 w-100"
			data-test={`${DATA_TEST_PREFIX}-reports-container`}
		>
			<h1 className="m-0">{i18n.t("Dashboards")}</h1>

			<DashboardHeader />

			<DashboardContainer />
		</div>
	);
}
