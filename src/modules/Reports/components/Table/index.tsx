/* eslint-disable indent */
import React from "react";
import { CustomDataTable, CustomDataTableColumn } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { Pagination } from "@hisptz/dhis2-utils";

import { FullPageLoader } from "../../../shared/components/Loaders";
import { isEmpty } from "lodash";

import {
	ReportColumn,
	ReportConfig,
	ProgramMapping,
} from "../../../shared/constants";
import { useRecoilState, useRecoilValue } from "recoil";
import { SelectedReport } from "./FilterArea/components/FilterField";
import { useSetting } from "@dhis2/app-service-datastore";
import { sanitizeReportData } from "./hooks/data";
import { DATDevicesReportState, DHIS2ReportState } from "../../state/report";
import Download from "../Download";
import { useAlert } from "@dhis2/app-runtime";

export interface ReportTableProps {
	loading: boolean;
	reports: [];
	pagination: Pagination;
	programMapping: ProgramMapping;
	paginationDAT: Pagination;
	data: any;
	loadingDevices: boolean;
	error: any;
	adherenceStreakData: any;
}

export default function ReportTable({
	loading,
	reports,
	pagination,
	paginationDAT,
	data,
	programMapping,
	loadingDevices,
	error,
	adherenceStreakData,
}: ReportTableProps) {
	const [report] = useRecoilState<ReportConfig>(SelectedReport);
	const deviceList = useRecoilValue(DATDevicesReportState);
	const d2ReportData = useRecoilValue(DHIS2ReportState);
	const [regimenSettings] = useSetting("regimenSetting", {
		global: true,
	});

	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 2000 }),
	);

	if (error) {
		show({
			message: `${error}`,
			type: { info: true },
		});
	}

	return (
		<div className="w-100 h-100">
			<div className=" p-8 w-100 h-100 gap-16 column">
				{(loading && isEmpty(reports)) ||
				(loadingDevices && isEmpty(data)) ? (
					<FullPageLoader />
				) : (
					<>
						<div style={{ display: "flex", justifyContent: "end" }}>
							{error ? null : (
								<Download
									enabled={
										report?.id !==
										"dat-device-summary-report"
											? !loading && !isEmpty(reports)
											: !loadingDevices && !isEmpty(data)
									}
									data={sanitizeReportData(
										report?.id !==
											"dat-device-summary-report"
											? d2ReportData
											: deviceList,

										regimenSettings,
										programMapping,
										true,
										deviceList,
										adherenceStreakData,
									)}
									columns={report.columns as ReportColumn[]}
								/>
							)}
						</div>
						<CustomDataTable
							emptyLabel={
								!isEmpty(programMapping)
									? i18n.t(
											"There is no report data for the selected filters",
									  )
									: i18n.t(
											"There are no program mappings set, please go to configurations",
									  )
							}
							loading={loading || loadingDevices}
							columns={report.columns as CustomDataTableColumn[]}
							pagination={
								report.id !== "dat-device-summary-report"
									? pagination
									: paginationDAT
							}
							rows={
								error
									? []
									: sanitizeReportData(
											report?.id !==
												"dat-device-summary-report"
												? reports
												: data,
											regimenSettings,
											programMapping,
											false,
											deviceList,
											adherenceStreakData,
									  )
							}
						/>
					</>
				)}
			</div>
		</div>
	);
}
