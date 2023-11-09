import React from "react";
import i18n from "@dhis2/d2-i18n";
import { FilterField, SelectedReport } from "./components/FilterField";
import { useRecoilState } from "recoil";
import { ReportConfig } from "../../../../shared/constants";

export default function FilterArea() {
	const [report] = useRecoilState<ReportConfig>(SelectedReport);
	return (
		<div
			style={{
				display: "flex",
				justifyContent: "start",
				padding: "0px 16px 16px 16px",
				borderBottom: "2px solid #d8e0e7",
			}}
		>
			<FilterField
				name="reportType"
				label={i18n.t("Report")}
				type="report"
			/>

			{report.filters.includes("ou") ? (
				<FilterField
					name="ou"
					label={i18n.t("Organisation units")}
					type="organisation units"
				/>
			) : null}
			{report.filters.includes("pe") ? (
				<FilterField
					name="periods"
					label={i18n.t("Periods")}
					type="periods"
				/>
			) : null}
		</div>
	);
}
