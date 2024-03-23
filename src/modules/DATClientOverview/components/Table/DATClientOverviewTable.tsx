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
import {
	useAdherenceEvents,
	useDeviceData,
} from "../../../shared/components/ProfileArea/utils";

import { Pagination } from "@hisptz/dhis2-utils";
import BatteryLevel from "../../../shared/components/BatteryLevel/BatteryLevel";
import { getProgramMapping } from "../../../shared/utils";
import { RegimenSetting } from "../../../shared/constants";
import { DateTime } from "luxon";
import { GetAdherenceStreak } from "../../../Reports/components/Table/hooks/adherenceStreak";

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
	const [DATClientOverview] = useSetting("DATClientOverview", {
		global: true,
	});
	const [regimenSettings] = useSetting("regimenSetting", {
		global: true,
	});

	const navigate = useNavigate();
	const [programMapping] = useSetting("programMapping", {
		global: true,
	});
	const [params] = useSearchParams();
	const currentProgram = params.get("program");

	const mapping = getProgramMapping(programMapping, currentProgram);

	const onRowClick = async (id: string) => {
		const row = patients.find((patient) => patient.id === id);

		if (row) {
			await navigate(
				`/dat-client-overview/${row.id}?program=${currentProgram}`,
			);
		}
	};

	function getOverallAdherence(patient: PatientProfile) {
		const { filteredEvents } = useAdherenceEvents(
			patient.events,
			mapping?.programStage ?? "",
		);

		const groupDataByWeeks = () => {
			const groupedData: any = {};
			filteredEvents?.forEach((item: any) => {
				const occurredDate = new Date(item.occurredAt[0].value);
				const weekStartDate = new Date(
					occurredDate.getFullYear(),
					occurredDate.getMonth(),
					occurredDate.getDate() - occurredDate.getDay(),
				);
				const weekEndDate = new Date(
					weekStartDate.getFullYear(),
					weekStartDate.getMonth(),
					weekStartDate.getDate() + 6,
				);
				const week = `${weekStartDate.toLocaleDateString()} - ${weekEndDate.toLocaleDateString()}`;
				if (!groupedData[week]) {
					groupedData[week] = [];
				}
				groupedData[week].push(item);
			});
			return groupedData;
		};

		const groupDataByMonths = () => {
			const groupedData: any = {};
			filteredEvents?.forEach((item: any) => {
				const occurredDate = new Date(item.occurredAt[0].value);
				const year = occurredDate.getFullYear();
				const month = occurredDate.getMonth();
				const monthStartDate = new Date(year, month, 1);
				const monthEndDate = new Date(year, month + 1, 0);
				const monthKey = `${monthStartDate.toLocaleDateString()} - ${monthEndDate.toLocaleDateString()}`;
				if (!groupedData[monthKey]) {
					groupedData[monthKey] = [];
				}
				groupedData[monthKey].push(item);
			});
			return groupedData;
		};

		const groupedData =
			patient.adherenceFrequency == "Weekly"
				? groupDataByWeeks()
				: patient.adherenceFrequency == "Monthly"
				? groupDataByMonths()
				: {};

		const priortizeData = (dataArray: any) => {
			for (const key in dataArray) {
				const objects = dataArray[key];
				let found = false;
				for (let i = 0; i < objects.length; i++) {
					if (
						objects[i].dataValues.length > 0 &&
						(objects[i].dataValues[0].value === "Once" ||
							objects[i].dataValues[0].value === "Multiple")
					) {
						found = true;
						break;
					}
				}
				if (found) {
					dataArray[key] = objects.filter(
						(obj: any) =>
							obj.dataValues[0].value == "Once" ||
							obj.dataValues[0].value == "Multiple",
					);
				}
			}
			return dataArray;
		};

		const transformData = (dataArray: any) => {
			const resultArray = [];
			for (const key in dataArray) {
				if (dataArray[key].length > 0) {
					resultArray.push(dataArray[key][0]);
				}
			}
			return resultArray;
		};

		const events =
			patient.adherenceFrequency == "Daily"
				? filteredEvents
				: transformData(priortizeData(groupedData));

		const takenDoses = events?.filter((item: any): string => {
			return item.dataValues.some((dataValue: any) => {
				const value = dataValue.value;
				return value === "Once" || value === "Multiple";
			});
		}).length;

		const allEvents = isEmpty(filteredEvents) ? 1 : events.length;

		const newPercentage = ((takenDoses / allEvents) * 100).toFixed(2) + "%";

		const percentage = !isEmpty(regimenSettings)
			? (regimenSettings ?? [])
					.map((option: RegimenSetting) => {
						if (option.regimen === patient.regimen) {
							return (
								(
									(takenDoses /
										parseInt(option.numberOfDoses)) *
									100
								).toFixed(2) + "%"
							);
						} else {
							return "N/A";
						}
					})
					.filter((val: any) => val !== "N/A")
			: "N/A";

		const overallAdherence =
			percentage != "N/A" && !isEmpty(percentage)
				? head(percentage)
				: "N/A";

		return newPercentage;
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
							columns={
								DATClientOverview as CustomDataTableColumn[]
							}
							onRowClick={onRowClick}
							pagination={pagination}
							rows={(patients ?? []).map((patient) => {
								return {
									...(patient.tableData as CustomDataTableRow),
									adherenceStreak: (
										<GetAdherenceStreak patient={patient} />
									),
									overallAdherence:
										getOverallAdherence(patient),
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
