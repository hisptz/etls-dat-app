import {
	DATA_TEST_PREFIX,
	ReportConfig,
	USERGROUP_CODE,
} from "../shared/constants";
import React, { useEffect, useState } from "react";
import i18n from "@dhis2/d2-i18n";
import { Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { isEmpty } from "lodash";
import {
	useDATDevices,
	useReportTableData,
} from "./components/Table/hooks/data";
import FilterArea from "./components/Table/FilterArea";
import { Card, Center } from "@dhis2/ui";

import { SelectedReport } from "./components/Table/FilterArea/components/FilterField";
import { useRecoilState, useRecoilValue } from "recoil";

import { useSetting } from "@dhis2/app-service-datastore";
import ReportTable from "./components/Table";
import { getProgramMapping } from "../shared/utils";
import { ProgramsTab } from "../shared/components/ProgramsTab";
import { CurrentUserGroup } from "../shared/state/currentUser";

export function ReportsOutlet() {
	return <Outlet />;
}

export function Reports() {
	const [params] = useSearchParams();
	const [programMapping] = useSetting("programMapping", { global: true });
	const reportType = params.get("reportType");
	const period = params.get("periods");
	const orgUnit = params.get("ou");
	const program = params.get("program");
	const {
		reports,
		pagination,
		loading,
		getAllEvents,
		error,
		adherenceStreakData,
	} = useReportTableData();
	const { data, loadingDevice, paginationDAT, refetch, errorDevice } =
		useDATDevices();
	const [enabled, setEnabled] = useState<boolean>(false);
	const [report] = useRecoilState<ReportConfig>(SelectedReport);

	const mapping = getProgramMapping(programMapping, program);

	const navigate = useNavigate();
	const currentUserGroup = useRecoilValue(CurrentUserGroup);

	const hasAccess = currentUserGroup.some(
		(userGroup) => userGroup.code === USERGROUP_CODE,
	);

	useEffect(() => {
		if (reportType != "dat-device-summary-report") {
			if (!isEmpty(reportType && period && orgUnit && programMapping)) {
				getAllEvents();
				setEnabled(true);
			} else {
				setEnabled(false);
			}
		} else {
			if (!isEmpty(programMapping)) {
				setEnabled(true);
				refetch();
			}
		}
	}, [reportType, orgUnit, period, program]);

	return (
		<div
			className="column gap-16 p-16 h-100 w-100"
			data-test={`${DATA_TEST_PREFIX}-reports-container`}
		>
			<h1 className="m-0" style={{ marginBottom: "0px" }}>
				{i18n.t("Reports")}
			</h1>
			{programMapping.length > 1 ? <ProgramsTab /> : null}
			<FilterArea />

			{isEmpty(programMapping) ? (
				<div style={{ marginTop: "0px", height: "100%" }}>
					<Card>
						<Center>
							<div
								style={{
									padding: "16px",
									height: "61vh",
									fontSize: "18px",
									color: "#6e7a8b",
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
								}}
							>
								{hasAccess ? (
									<>
										<span>
											{i18n.t(
												"Program Mappings are not configured. Please click the link below to go to configurations.",
											)}
										</span>
										<br />
										<span
											style={{
												color: "#1362bc",
												cursor: "pointer",
												fontWeight: "600",
											}}
											onClick={() =>
												navigate("/configuration")
											}
										>
											{i18n.t("Configuration")}
										</span>
									</>
								) : (
									<span>
										{i18n.t(
											"Program Mappings are not configured. Please contact the administrators.",
										)}
									</span>
								)}
							</div>
						</Center>
					</Card>
				</div>
			) : (
				<>
					<div>
						{enabled ? (
							<div className="flex-1">
								<ReportTable
									reports={reports}
									pagination={pagination}
									paginationDAT={paginationDAT}
									loading={
										reportType ===
										"dat-device-summary-report"
											? loadingDevice
											: loading
									}
									programMapping={mapping ?? {}}
									data={data}
									loadingDevices={loadingDevice}
									error={
										reportType ===
										"dat-device-summary-report"
											? errorDevice
											: error
									}
									adherenceStreakData={adherenceStreakData}
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
										report.name !==
											"DAT Device Summary Report" &&
										report.name !== ""
											? ", organisation unit and periods above to get started!"
											: ""
									}`,
								)}
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
}
