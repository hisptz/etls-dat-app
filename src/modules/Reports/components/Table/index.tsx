/* eslint-disable indent */
import React from "react";
import {
	CustomDataTable,
	CustomDataTableColumn,
	CustomDataTableRow,
} from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { Pagination } from "@hisptz/dhis2-utils";

import { FullPageLoader } from "../../../shared/components/Loaders";
import { isEmpty } from "lodash";
import { PatientProfile } from "../../../shared/models/profile";
import Download from "../../Download";

import { ReportConfig } from "../../../shared/constants";
import { useRecoilState } from "recoil";
import { SelectedReport } from "./FilterArea/components/FilterField";

export interface ReportTableProps {
	loading: boolean;
	reports: PatientProfile[];
	pagination: Pagination;
	data: any;
	loadingDevices: boolean;
}

export default function ReportTable({
	loading,
	reports,
	pagination,
	data,
	loadingDevices,
}: ReportTableProps) {
	const [report] = useRecoilState<ReportConfig>(SelectedReport);

	return (
		<div className="w-100 h-100">
			<div className=" p-8 w-100 h-100 gap-16 column">
				{(loading && isEmpty(reports)) ||
				(loadingDevices && isEmpty(data)) ? (
					<FullPageLoader />
				) : (
					<>
						<div style={{ display: "flex", justifyContent: "end" }}>
							<Download
								enabled={
									(!loading && !isEmpty(reports)) ||
									(!loadingDevices && !isEmpty(data))
								}
							/>
						</div>
						<CustomDataTable
							emptyLabel={i18n.t(
								"There is no report data for the selected filters",
							)}
							loading={loading || loadingDevices}
							columns={report.columns as CustomDataTableColumn[]}
							pagination={
								report.id !== "dat-device-summary-report"
									? pagination
									: null
							}
							rows={(report?.id !== "dat-device-summary-report"
								? reports
								: data.devices
							).map((report: any) => {
								return {
									...(report.tableData as CustomDataTableRow),
									deviceIMEINumber: report.imei,
									daysInUse: report.daysDeviceInUse,
									lastHeartbeat: report.lastHeartBeat,
									lastOpened: report.lastOpened,
									lastBatteryLevel: report.batteryLevel,
								};
							})}
						/>
					</>
				)}
			</div>
		</div>
	);
}
