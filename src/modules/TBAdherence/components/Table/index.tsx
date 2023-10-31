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
import { PatientProfile } from "../../../shared/models/profile";
import AdherenceStreak from "../../../shared/components/AdherenceStreak/AdherenceStreak";

export interface AdherenceTableProps {
	loading: boolean;
	patients: PatientProfile[];
	pagination: Pagination;
}

export default function TBAdherenceTable({
	loading,
	patients,
	pagination,
}: AdherenceTableProps) {
	const [TBAdherence] = useSetting("TBAdherence", { global: true });
	const navigate = useNavigate();

	const onRowClick = (id: string) => {
		const row = patients.find((patient) => patient.id === id);

		if (row) {
			navigate(`/tbadherence/${row.id}`);
		}
	};
	function getAdherenceStreak(patient: PatientProfile) {
		const events: any = [
			{
				date: patient.enrollmentDate,
				event: "enrolled",
			},
			patient.deviceSignal,
		];
		return (
			<div style={{ width: "120px" }}>
				<AdherenceStreak
					events={events}
					frequency={patient.adherenceFrequency}
				/>
			</div>
		);
	}

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
							columns={TBAdherence as CustomDataTableColumn[]}
							onRowClick={onRowClick}
							pagination={pagination}
							rows={patients.map((patient) => {
								return {
									...(patient.tableData as CustomDataTableRow),
									adherenceStreak:
										getAdherenceStreak(patient),
								};
							})}
						/>
					)}
				</div>
			</Card>
		</div>
	);
}
