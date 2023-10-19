import { DATA_TEST_PREFIX } from "../shared/constants";
import React, { useEffect, useState } from "react";
import i18n from "@dhis2/d2-i18n";

import { Outlet, useSearchParams } from "react-router-dom";

import { isEmpty } from "lodash";
import { useReportTableData } from "./components/Table/hooks/data";
import ReportTable from "./components/Table";
import FilterArea from "./components/Table/FilterArea";

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
		if (!isEmpty(reportType)) {
			setenabled(true);
			refetch({
				page: 1,
				periods,
				orgUnit,
			});
		} else {
			setenabled(false);
		}
	}, []);

	return (
		<div
			className="column gap-32 p-16 h-100 w-100"
			data-test={`${DATA_TEST_PREFIX}-reports-container`}
		>
			<h1 className="m-0" style={{ marginBottom: "16px" }}>
				{i18n.t("Reports")}
			</h1>
			<FilterArea
				loading={loading}
				onFetch={refetch}
				show={() => {
					setenabled(true);
				}}
				value={reportType! && periods! && orgUnit!}
			/>
			<div>
				{true ? (
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
