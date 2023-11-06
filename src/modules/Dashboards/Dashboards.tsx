import React from "react";
import i18n from "@dhis2/d2-i18n";

import { DATA_TEST_PREFIX } from "../shared/constants";


export function Dashboards() {
	return (
		<div
			className="column gap-32 p-16 h-100 w-100"
			data-test={`${DATA_TEST_PREFIX}-reports-container`}
		>
			<h1 className="m-0" style={{ marginBottom: "16px" }}>
				{i18n.t("Dashboards")}
			</h1>
		</div>
	);
}
