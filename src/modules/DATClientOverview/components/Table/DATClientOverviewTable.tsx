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
import { PatientProfile } from "../../../shared/models/profile";
import AdherenceStreak, {
	DateEvent,
} from "../../../shared/components/AdherenceStreak/AdherenceStreak";
import { useAdherenceEvents } from "../../../shared/components/ProfileArea/utils";

import { Pagination } from "@hisptz/dhis2-utils";
import BatteryLevel from "../../../shared/components/BatteryLevel/BatteryLevel";

export interface DATClientTableProps {
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

export default function DATClientTable({
	loading,
	patients,
	pagination,
	onSort,
	sortState,
}: DATClientTableProps) {
	const [TBAdherence] = useSetting("TBAdherence", { global: true });

	const navigate = useNavigate();
	const [programMapping] = useSetting("programMapping", {
		global: true,
	});
	const [params, setParams] = useSearchParams();
	const currentProgram =
		params.get("program") ?? (head(programMapping) as any)?.program ?? "";

	const selectedProgram = programMapping.filter(
		(mapping: any) => mapping.program === currentProgram,
	);
	const program = selectedProgram[0];

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

	function getAdherenceStreak(patient: PatientProfile) {
		const { filteredEvents } = useAdherenceEvents(
			patient.events,
			program?.programStage,
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
						: item.dataValues[0].value == "None"
						? ""
						: "",
			};
		});
		const events: DateEvent[] = [
			...adherenceEvents,
			{
				date: patient.enrollmentDate,
				event: "enrolled",
			},
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
									battery: (
										<BatteryLevel
											device={patient.deviceIMEINumber}
										/>
									),
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
