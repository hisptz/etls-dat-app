import React, { useEffect, useState } from "react";
import {
	CustomDataTable,
	CustomDataTableColumn,
	CustomDataTableRow,
} from "@hisptz/dhis2-ui";
import { Card } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { Pagination } from "@hisptz/dhis2-utils";
import { useSetting } from "@dhis2/app-service-datastore";
import { FullPageLoader } from "../../../shared/components/Loaders";

import { isEmpty } from "lodash";

import { PatientProfile } from "../../../shared/models/profile";
import Download from "../../Download";
import { useSearchParams } from "react-router-dom";
import { ReportConfig } from "../../../shared/constants";

export interface AdherenceTableProps {
	loading: boolean;
	reports: PatientProfile[];
	pagination: Pagination;
}

export default function ReportTable({
	loading,
	reports,
	pagination,
}: AdherenceTableProps) {
	const [Reports] = useSetting("reports", { global: true });
	const [params] = useSearchParams();
	const reportType = params.get("reportType");
	const [selectedReport, setSelectedReport] = useState<[] | any>();

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
							<Download enabled={!loading && !isEmpty(reports)} />
						</div>
						<CustomDataTable
							emptyLabel={i18n.t(
								"There is no report data for the selected filters",
							)}
							loading={loading}
							columns={selectedReport as CustomDataTableColumn[]}
							pagination={pagination}
							rows={reports.map((report) => {
								return {
									...(report.tableData as CustomDataTableRow),
								};
							})}
						/>
					</>
				)}
			</div>
		</div>
	);
}
