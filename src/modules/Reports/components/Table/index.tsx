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
import { useAdherenceEvents } from "../../../shared/components/ProfileArea/utils";
import { regimenSetting } from "../../../shared/constants";

export interface ReportTableProps {
	loading: boolean;
	reports: PatientProfile[];
	pagination: Pagination;
}

export interface DATDeviceTableProps {
	pagination: Pagination;
	data: any;
	loadingDevices: boolean;
}

export function ReportTable({
	loading,
	reports,
	pagination,
}: ReportTableProps) {
	const [Reports] = useSetting("reports", { global: true });
	const [params] = useSearchParams();
	const reportType = params.get("reportType");
	const [selectedReport, setSelectedReport] = useState<[] | any>([]);
	const [programMapping] = useSetting("programMapping", {
		global: true,
	});
	const [regimen] = useSetting("regimenSetting", {
		global: true,
	});

	useEffect(() => {
		if (!isEmpty(Reports && reportType)) {
			Reports.map((report: ReportConfig) => {
				if (report.id === reportType) {
					setSelectedReport(report.columns);
				}
			});
		}
	}, [reportType]);

	return (
		<div className="w-100 h-100">
			<div className="p-16 w-100 h-100 gap-16 column">
				{loading && isEmpty(reports) ? (
					<FullPageLoader />
				) : (
					<>
						<div style={{ display: "flex", justifyContent: "end" }}>
							{reportType ==
							"dat-device-summary-report" ? null : (
								<Download
									enabled={!loading && !isEmpty(reports)}
								/>
							)}
						</div>
						<CustomDataTable
							emptyLabel={i18n.t(
								"There is no report data for the selected filters",
							)}
							loading={loading}
							columns={selectedReport as CustomDataTableColumn[]}
							pagination={pagination}
							rows={reports.map((report, index) => {
								const { filteredEvents } = useAdherenceEvents(
									reports[index].events,
									programMapping.programStage,
								);
								const MissedDoses = filteredEvents.filter(
									(item: any) => {
										return item.dataValues.some(
											(dataValue: any) =>
												dataValue.value === "Heartbeat",
										);
									},
								);
								const takenDoses = filteredEvents.filter(
									(item: any) => {
										return item.dataValues.some(
											(dataValue: any) => {
												const value = dataValue.value;
												return (
													value === "Once" ||
													value === "Multiple"
												);
											},
										);
									},
								);
								const adherencePercentage = !isEmpty(regimen)
									? regimen.map((option: regimenSetting) => {
											if (
												option.administration ==
												report.adherenceFrequency
											) {
												return (
													(
														(takenDoses.length /
															parseInt(
																option.idealDoses,
															)) *
														100
													).toFixed(2) + "%"
												);
											} else {
												return "N/A";
											}
									  })
									: "N/A";

								return {
									...(report.tableData as CustomDataTableRow),
									numberOfMissedDoses: MissedDoses.length,
									adherencePercentage: adherencePercentage,
								};
							})}
						/>
					</>
				)}
			</div>
		</div>
	);
}

export function DATDeviceReportTable({
	data,
	loadingDevices,
}: DATDeviceTableProps) {
	const [Reports] = useSetting("reports", { global: true });
	const [params] = useSearchParams();
	const reportType = params.get("reportType");
	const [selectedReport, setSelectedReport] = useState<[] | any>([]);

	useEffect(() => {
		if (!isEmpty(Reports && reportType)) {
			Reports.map((report: ReportConfig) => {
				if (report.id === reportType) {
					setSelectedReport(report.columns);
				}
			});
		}
	}, [reportType]);

	return (
		<div className="w-100 h-100">
			<div className="p-16 w-100 h-100 gap-16 column">
				{loadingDevices && isEmpty(data) ? (
					<FullPageLoader />
				) : (
					<>
						<div style={{ display: "flex", justifyContent: "end" }}>
							<Download
								enabled={!loadingDevices && !isEmpty(data)}
							/>
						</div>
						<div style={{ height: "66vh", overflowY: "scroll" }}>
							<CustomDataTable
								emptyLabel={i18n.t(
									"There is no report data for the selected filters",
								)}
								loading={loadingDevices}
								columns={
									selectedReport as CustomDataTableColumn[]
								}
								rows={data.devices.map((report: any) => {
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
						</div>
					</>
				)}
			</div>
		</div>
	);
}
