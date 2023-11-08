/* eslint-disable indent */
import React, { useEffect, useState } from "react";
import {
	CustomDataTable,
	CustomDataTableColumn,
	CustomDataTableRow,
} from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { Pagination } from "@hisptz/dhis2-utils";
import { useSetting } from "@dhis2/app-service-datastore";
import { FullPageLoader } from "../../../shared/components/Loaders";
import { isEmpty } from "lodash";
import { PatientProfile } from "../../../shared/models/profile";
import Download from "../../Download";
import { useSearchParams } from "react-router-dom";
import { ReportConfig } from "../../../shared/constants";

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
	const [Reports] = useSetting("reports", { global: true });
	const [params] = useSearchParams();
	const reportType = params.get("reportType");
	const [selectedReport, setSelectedReport] = useState<ReportConfig>();

	useEffect(() => {
		if (!isEmpty(Reports && reportType)) {
			Reports.map((report: ReportConfig) => {
				if (report.id === reportType) {
					setSelectedReport(report);
				}
			});
		}
	}, [reportType]);

	return (
		<div className="w-100 h-100">
			<div className="p-16 w-100 h-100 gap-16 column">
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
							columns={
								(selectedReport?.columns as CustomDataTableColumn[]) ??
								([] as CustomDataTableColumn[])
							}
							pagination={
								selectedReport?.id !=
								"dat-device-summary-report"
									? pagination
									: null
							}
							rows={
								selectedReport?.id !=
								"dat-device-summary-report"
									? reports.map((report) => {
											return {
												...(report.tableData as CustomDataTableRow),
											};
									  })
									: data.devices.map((report: any) => {
											return {
												...(report.tableData as CustomDataTableRow),
												deviceIMEINumber: report.imei,
												daysInUse:
													report.daysDeviceInUse,
												lastHeartbeat:
													report.lastHeartBeat,
												lastOpened: report.lastOpened,
												lastBatteryLevel:
													report.batteryLevel,
											};
									  })
							}
						/>
					</>
				)}
			</div>
		</div>
	);
}
