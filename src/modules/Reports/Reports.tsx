import { DATA_TEST_PREFIX } from "../shared/constants";
import React, { useEffect, useState } from "react";
import i18n from "@dhis2/d2-i18n";
import { Outlet, useSearchParams } from "react-router-dom";
import { isEmpty } from "lodash";
import { useReportTableData } from "./components/Table/hooks/data";
import ReportTable from "./components/Table";
import FilterArea from "./components/Table/FilterArea";
import { getDefaultReportFilters } from "./constants/filters";

export function ReportsOutlet() {
	return <Outlet />;
}

export function Reports() {
	const [params] = useSearchParams();
	const reportType = params.get("reportType");
	const periods = params.get("periods");
	const orgUnit = params.get("ou");
	const { reports, pagination, loading, refetch } = useReportTableData();
	const [enabled, setenabled] = useState<boolean>(false);

	useEffect(() => {
		if (!isEmpty(reportType && periods && orgUnit)) {
			setenabled(true);
			refetch({
				page: 1,
				orgUnit,
				periods,
			});
		} else {
			setenabled(false);
		}
	}, [reportType, orgUnit, periods]);

	return (
		<div
			className="column gap-32 p-16 h-100 w-100"
			data-test={`${DATA_TEST_PREFIX}-reports-container`}
		>
			<h1 className="m-0" style={{ marginBottom: "16px" }}>
				{i18n.t("Reports")}
			</h1>
			<FilterArea />
			<div>
				{enabled ? (
					<div className="flex-1">
						<ReportTable
							reports={reports}
							pagination={pagination}
							loading={loading}
						/>
					</div>
				) : (
					<div
						className="h-100 w-100"
						style={{
							display: "flex",
							justifyContent: "center",
							padding: "64px",
							fontSize: "18px",
						}}
					>
						{i18n.t(
							"Select type of report, organisation unit and periods above to get started!",
						)}
					</div>
				)}
			</div>
		</div>
	);
}
