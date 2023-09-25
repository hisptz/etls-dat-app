import React from "react";
import i18n from "@dhis2/d2-i18n";
import { FilterField } from "./FilterField";

export function PropertiesFilter() {
	return (
		<div className="column gap-16">
			<h3 className="m-0" style={{ marginBottom: "25px" }}>
				{i18n.t("Search Criteria")}
			</h3>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, 360px)",
					gap: "16px",
					width: "100%",
				}}
			>
				<FilterField
					name="tbDistrictNumber"
					label={i18n.t("TB District Number")}
					type="text"
				/>
				<FilterField
					name="deviceEMInumber"
					label={i18n.t("Device EMI Number")}
					type="text"
				/>
				<FilterField
					name="orgUnit"
					label={i18n.t("Organisation Unit")}
					type="orgUnit"
				/>
			</div>
		</div>
	);
}
