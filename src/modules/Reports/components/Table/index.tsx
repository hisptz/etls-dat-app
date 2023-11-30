/* eslint-disable indent */
import React from "react";
import {
	CustomDataTable,
	CustomDataTableColumn,
} from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { Pagination } from "@hisptz/dhis2-utils";

import { FullPageLoader } from "../../../shared/components/Loaders";
import { isEmpty } from "lodash";
import Download from "../../Download";

import { ReportColumn, ReportConfig } from "../../../shared/constants";
import { useRecoilState, useRecoilValue } from "recoil";
import { SelectedReport } from "./FilterArea/components/FilterField";
import { useSetting } from "@dhis2/app-service-datastore";
import { sanitizeReportData } from "./hooks/data";
import { DATDevicesReportState, DHID2ReportState } from "../../state/report";

export interface ReportTableProps {
	loading: boolean;
	reports: [];
	pagination: Pagination;
	paginationDAT: Pagination;
	data: any;
	loadingDevices: boolean;
}

export default function ReportTable({
	loading,
	reports,
	pagination,
	paginationDAT,
	data,
	loadingDevices,
}: ReportTableProps) {
	const [report] = useRecoilState<ReportConfig>(SelectedReport);
	const deviceList = useRecoilValue(DATDevicesReportState);
	const d2ReportData = useRecoilValue(DHID2ReportState);
	const [programMapping] = useSetting("programMapping", {
		global: true,
	});
	const [regimenSettings] = useSetting("regimenSetting", {
		global: true,
	});

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
								data={sanitizeReportData(
									report?.id !== "dat-device-summary-report"
									? d2ReportData
									: deviceList,
									regimenSettings,
									programMapping,
									)}
								columns={report.columns as ReportColumn[]}
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
									: paginationDAT
							}
							rows={sanitizeReportData(
								report?.id !== "dat-device-summary-report"
									? reports
									: data,
								regimenSettings,
								programMapping,
							)}
						/>
					</>
				)}
			</div>
		</div>
	);
}
