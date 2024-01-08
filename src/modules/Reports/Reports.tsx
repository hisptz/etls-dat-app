import { DATA_TEST_PREFIX, ReportConfig } from "../shared/constants";
import React, { useEffect, useState } from "react";
import i18n from "@dhis2/d2-i18n";
import { Outlet, useSearchParams } from "react-router-dom";
import { isEmpty } from "lodash";
import {
	useDATDevices,
	useReportTableData,
} from "./components/Table/hooks/data";
import FilterArea from "./components/Table/FilterArea";

import { SelectedReport } from "./components/Table/FilterArea/components/FilterField";
import { useRecoilState } from "recoil";
import { ProgramsTab } from "../TBAdherence/components/ProgramsTab";
import { useSetting } from "@dhis2/app-service-datastore";
import ReportTable from "./components/Table";
import { getProgramMapping } from "../shared/utils";

export function ReportsOutlet() {
	return <Outlet />;
}

export function Reports() {
	const [params] = useSearchParams();
	const [programMappings] = useSetting("programMapping", { global: true });
	const reportType = params.get("reportType");
	const period = params.get("periods");
	const orgUnit = params.get("ou");
	const program = params.get("program");
	const { reports, pagination, loading, getAllEvents } = useReportTableData();
	const { data, loadingDevice, paginationDAT } = useDATDevices();
	const [enabled, setEnabled] = useState<boolean>(false);
	const [report] = useRecoilState<ReportConfig>(SelectedReport);

	const selectedProgramMapping = getProgramMapping(programMappings, program);

	useEffect(() => {
		if (reportType != "dat-device-summary-report") {
			if (!isEmpty(reportType && period && orgUnit)) {
				getAllEvents();
				setEnabled(true);
			} else {
				setEnabled(false);
			}
		} else {
			setEnabled(true);
		}
	}, [reportType, orgUnit, period, program]);

	return (
		<div
			className="column gap-16 p-16 h-100 w-100"
			data-test={`${DATA_TEST_PREFIX}-reports-container`}
		>
			<h1 className="m-0" style={{ marginBottom: "16px" }}>
				{i18n.t("Reports")}
			</h1>
			{!isEmpty(programMappings) ? <ProgramsTab /> : null}
			<FilterArea />
			<div>
				{enabled ? (
					<div className="flex-1">
						<ReportTable
							reports={reports}
							pagination={pagination}
							paginationDAT={paginationDAT}
							loading={loading}
							programMapping={selectedProgramMapping ?? {}}
							data={data}
							loadingDevices={loadingDevice}
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
							`Select type of report ${
								report.name !== "DAT Device Summary Report" &&
								report.name !== ""
									? ", organisation unit and periods above to get started!"
									: ""
							}`,
						)}
					</div>
				)}
			</div>
		</div>
	);
}
