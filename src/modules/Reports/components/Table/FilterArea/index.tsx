import React from "react";
import i18n from "@dhis2/d2-i18n";
import { FilterField } from "./components/FilterField";
import { useSearchParams } from "react-router-dom";

export default function FilterArea() {
	const [params] = useSearchParams();
	const reportType = params.get("reportType");
	return (
		<div
			style={{
				display: "flex",
				justifyContent: "start",
				padding: "0px 16px 16px 16px",
				borderBottom: "2px solid #d8e0e7",
			}}
		>
			<FilterField name="reportType" label="Report" type="report" />

			{reportType == "dat-device-summary-report" ? null : (
				<>
					<FilterField
						name="ou"
						label="Organisation units"
						type="organisation units"
					/>
					<FilterField
						name="periods"
						label="Periods"
						type="periods"
					/>
				</>
			)}
		</div>
	);
}
