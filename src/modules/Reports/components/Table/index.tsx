import React from "react";
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
import { useNavigate } from "react-router-dom";
import { reportProfile } from "../../../shared/models/profile";
import Download from "../../Download";

export interface AdherenceTableProps {
	loading: boolean;
	reports: reportProfile[];
	pagination: Pagination;
}

export default function ReportTable({
	loading,
	reports,
	pagination,
}: AdherenceTableProps) {
	const [TBAdherence] = useSetting("TBAdherence", { global: true });
	const navigate = useNavigate();

	const onRowClick = (id: string) => {
		const row = reports.find((report) => report.id === id);

		if (row) {
			navigate(`/tbadherence/${row.id}`);
		}
	};

	return (
		<div className="w-100 h-100">
			<div className="p-16 w-100 h-100 gap-16 column">
				{loading && isEmpty(reports) ? (
					<FullPageLoader />
				) : (
					<>
						<div style={{ display: "flex", justifyContent: "end" }}>
							<Download enabled={!loading} />
						</div>
						<CustomDataTable
							emptyLabel={i18n.t(
								"There is no report data for the selected filters",
							)}
							loading={loading}
							columns={TBAdherence as CustomDataTableColumn[]}
							onRowClick={onRowClick}
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
