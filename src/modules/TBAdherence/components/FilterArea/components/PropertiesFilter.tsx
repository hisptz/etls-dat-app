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
					gridTemplateColumns: "repeat(auto-fill, 280px)",
					gap: "16px",
					width: "100%",
				}}
			>
				<FilterField
					name="patientNumber"
					label={i18n.t("Patient Number")}
					type="text"
				/>
				<FilterField
					name="firstName"
					label={i18n.t("First Name")}
					type="text"
				/>
				<FilterField
					name="surname"
					label={i18n.t("Surname")}
					type="text"
				/>
				<FilterField
					name="deviceIMEInumber"
					label={i18n.t("Device IMEI Number")}
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
