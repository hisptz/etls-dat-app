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
import { isEmpty } from "lodash";
import { useNavigate, useSearchParams } from "react-router-dom";

import { PatientProfile } from "../../../shared/models";
import { Pagination } from "@hisptz/dhis2-utils";

export interface DATAssignmentTableProps {
	loading: boolean;
	patients: PatientProfile[];
	pagination: Pagination;
	onSort: (sort: any) => void;
	sortState:
		| {
				name: string;
				direction: "desc" | "default" | "asc";
		  }
		| undefined;
}

export default function DATAssignmentTable({
	loading,
	patients,
	pagination,
	onSort,
	sortState,
}: DATAssignmentTableProps) {
	const [DATAssignment] = useSetting("DATAssignment", { global: true });

	const navigate = useNavigate();

	const [params] = useSearchParams();
	const currentProgram = params.get("program");

	const onRowClick = async (id: string) => {
		const row = patients.find((patient) => patient.id === id);

		if (row) {
			await navigate(
				`/dat-assignment/${row.id}?program=${currentProgram}`,
			);
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
