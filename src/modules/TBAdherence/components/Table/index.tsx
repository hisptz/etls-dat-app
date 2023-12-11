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
import AdherenceStreak, {
	DateEvent,
} from "../../../shared/components/AdherenceStreak/AdherenceStreak";
import { useAdherenceEvents } from "../../../shared/components/ProfileArea/utils";
import { DateTime } from "luxon";

export interface AdherenceTableProps {
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

export default function TBAdherenceTable({
	loading,
	patients,
	pagination,
	onSort,
	sortState,
}: AdherenceTableProps) {
	const [TBAdherence] = useSetting("TBAdherence", { global: true });
	const navigate = useNavigate();
	const [programMapping] = useSetting("programMapping", {
		global: true,
	});

	const onRowClick = (id: string) => {
		const row = patients.find((patient) => patient.id === id);

		if (row) {
			navigate(`/treatment-adherence/${row.id}`);
		}
	};

	function getAdherenceStreak(patient: PatientProfile) {
		const { filteredEvents } = useAdherenceEvents(
			patient.events,
			programMapping.programStage,
		);

		const adherenceEvents = filteredEvents.map((item: any) => {
			return {
				date: item.occurredAt[0].value,
				event:
					item.dataValues[0].value == "Once"
						? "takenDose"
						: item.dataValues[0].value == "Multiple"
						? "takenDose"
						: item.dataValues[0].value == "Heartbeat"
						? "notTakenDose"
						: item.dataValues[0].value == "Enrollment"
						? "enrolled"
						: item.dataValues[0].value == "None"
						? ""
						: "",
			};
		});
		const events: DateEvent[] = [...adherenceEvents];
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
							onSort={onSort}
							sortState={sortState}
						/>
					)}
				</div>
			</Card>
		</div>
	);
}
