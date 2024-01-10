import React from "react";
import {
	CustomDataTable,
	CustomDataTableColumn,
	CustomDataTableRow,
} from "@hisptz/dhis2-ui";
import { Card } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { useSetting } from "@dhis2/app-service-datastore";
import { FullPageLoader } from "../../../shared/components/Loaders";
import { head, isEmpty } from "lodash";
import { useNavigate, useSearchParams } from "react-router-dom";

import { AdherenceTableProps } from ".";

export default function DATAssignmentTable({
	loading,
	patients,
	pagination,
	onSort,
	sortState,
}: AdherenceTableProps) {
	const [DATAssignment] = useSetting("DATAssignment", { global: true });

	const navigate = useNavigate();
	const [programMapping] = useSetting("programMapping", {
		global: true,
	});
	const [params, setParams] = useSearchParams();
	const currentProgram =
		params.get("program") ?? (head(programMapping) as any)?.program ?? "";

	const onRowClick = async (id: string) => {
		const row = patients.find((patient) => patient.id === id);

		if (row) {
			await navigate(`/dat-client-overview/${row.id}`);

			setParams(() => {
				const updatedParams = new URLSearchParams();
				updatedParams.set("program", currentProgram ?? "");

				return updatedParams;
			});
		}
	};

	return (
		<div className="w-100 h-100">
			<Card id="reportTable">
				<div className="p-16 w-100 h-100 gap-16 column">
					{loading && isEmpty(patients) ? (
						<FullPageLoader />
					) : (
						<CustomDataTable
							emptyLabel={i18n.t(
								"There is no data for the selected filters",
							)}
							loading={loading}
							columns={DATAssignment as CustomDataTableColumn[]}
							onRowClick={onRowClick}
							pagination={pagination}
							rows={patients.map((patient) => {
								return {
									...(patient.tableData as CustomDataTableRow),
								};
							})}
							onSort={onSort}
							sortState={sortState}
						/>
					)}
				</div>
			</Card>
		</div>
	);
}
