import React, { useState } from "react";
import i18n from "@dhis2/d2-i18n";
import styles from "./adherenceCalendar.module.css";
import Calendar, { DateEvent } from "./components/calendar";
import { DateTime } from "luxon";
import { useSetting } from "@dhis2/app-service-datastore";
import { useSearchParams } from "react-router-dom";
import { PatientProfile } from "../../models";
import { getProgramMapping } from "../../utils";
import { useAdherenceEvents } from "../ProfileArea/utils";
import NoDeviceAssigned from "../ProfileArea/NoDeviceAssigned";
import BatteryLevel from "../BatteryLevel/BatteryLevel";

export interface ProfileAreaProps {
	profile: PatientProfile;
	data: any;
}

function AdherenceCalendar({ profile, data }: ProfileAreaProps) {
	const [programMapping] = useSetting("programMapping", {
		global: true,
	});

	const [params] = useSearchParams();

	const currentProgram = params.get("program");

	const mapping = getProgramMapping(programMapping, currentProgram);
	const { filteredEvents } = useAdherenceEvents(
		profile.events,
		mapping?.programStage ?? "",
	);

	const formatDateWithTime = (date: string) => {
		const eventDateTime = DateTime.fromISO(date).toFormat(
			"MMMM dd, yyyy hh:mm a",
		);

		return eventDateTime;
	};

	const formatDate = (date: string) => {
		const eventDateTime = DateTime.fromISO(date).toFormat("MMMM dd, yyyy");

		return eventDateTime;
	};
	const [formattedDate, setFormattedDate] = useState<string>();

	const [batteryLevel, setBatteryLevel] = useState<any>();

	const [formattedDateWithTime, setFormattedDateWithTime] =
		useState<string>();

	const [eventCode, setEventCode] = useState<string>();

	const enrollmentDate =
		DateTime.fromFormat(
			data?.enrollmentDate ?? "",
			"yyyy-MM-dd HH:mm:ss",
		).toISO() ?? "";

	filteredEvents.push({
		dataValues: [
			{
				value: "DeviceEnrollmentDate",
			},
		],
		occurredAt: [
			{
				value: enrollmentDate,
			},
		],
		batteryLevel: [],
	});

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
					: item.dataValues[0].value == "DeviceEnrollmentDate"
					? "enrolled"
					: item.dataValues[0].value == "None"
					? ""
					: "",
			batteryLevel: item.batteryLevel[0]?.value ?? "",
		};
	});

	const events: DateEvent[] = [...adherenceEvents];

	const refillAlarm =
		DateTime.fromFormat(
			data?.refillAlarm ?? "",
			"yyyy-MM-dd HH:mm:ss",
		).toFormat("MMMM dd, yyyy hh:mm a") ?? "";

	const lastUpdated =
		DateTime.fromFormat(
			data?.lastOpened ?? "",
			"yyyy-MM-dd HH:mm:ss",
		).toFormat("MMMM dd, yyyy hh:mm a") ?? "";

	const doseAlarm =
		DateTime.fromFormat(data?.alarmTime ?? "", "HH:mm:ss").toFormat(
			"hh:mm a",
		) ?? "";

	data?.batteryLevel ? data.batteryLevel + "%" : "N/A";

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "row",
				flexWrap: "wrap",
				width: "100%",
				marginTop: "12px",
			}}
		>
			<div
				style={{
					height: "auto",
					flex: "4",
					marginRight: "12px",
				}}
			>
				<Calendar
					events={events}
					frequency={profile.adherenceFrequency}
					onClick={(val) => {
						setBatteryLevel(val.batteryLevel);
						setFormattedDateWithTime(formatDateWithTime(val.date));
						setFormattedDate(formatDate(val.date));
						setEventCode(val.event);
					}}
				/>
			</div>
			<div
				style={{
					flex: "2",
					height: "auto",
					padding: "32px",
				}}
			>
				{profile.deviceIMEINumber == "N/A" ? (
					<NoDeviceAssigned
						title={i18n.t("Missing Dose Data")}
						message={
							<span>
								<span style={{ fontWeight: "600" }}>
									{profile.name}
								</span>
								{i18n.t(" has no dose data recorded")}
							</span>
						}
					/>
				) : (
					<>
						<label
							className={styles["label-value"]}
							htmlFor="value"
						>
							<h3>
								{i18n.t(
									`Records as per: ${formattedDate ?? ""}`,
								)}
							</h3>
						</label>
						<div className={styles["profile-container"]}>
							{eventCode == "blue" ? (
								<>
									<div className={styles["grid-item"]}>
										<label
											className={styles["label-title"]}
											htmlFor="name"
										>
											{i18n.t("Summary")}
										</label>
										<label
											className={styles["label-value"]}
											htmlFor="value"
										>
											{i18n.t(
												`${profile.name} was enrolled into the system`,
											)}
										</label>
									</div>
									<div className={styles["grid-item"]}>
										<label
											className={styles["label-title"]}
											htmlFor="name"
										>
											{i18n.t("Enrollment time")}
										</label>
										<label
											className={styles["label-value"]}
											htmlFor="value"
										>
											{i18n.t(
												formattedDateWithTime ?? "",
											)}
										</label>
									</div>
								</>
							) : null}
							{eventCode != "blue" ? (
								<>
									<div className={styles["grid-item"]}>
										<label
											className={styles["label-title"]}
											htmlFor="name"
										>
											{i18n.t("Dose Taken")}
										</label>
										<label
											className={styles["label-value"]}
											htmlFor="value"
										>
											{eventCode == "green"
												? i18n.t("Yes")
												: eventCode == "red"
												? i18n.t("No")
												: i18n.t("N/A")}
										</label>
									</div>
									<div className={styles["grid-item"]}>
										<label
											className={styles["label-title"]}
											htmlFor="name"
										>
											{i18n.t("Dose Taken at")}
										</label>
										<label
											className={styles["label-value"]}
											htmlFor="value"
										>
											{eventCode == "green"
												? formattedDateWithTime
												: i18n.t("N/A")}
										</label>
									</div>
								</>
							) : null}

							<div className={styles["grid-item"]}>
								<label
									className={styles["label-title"]}
									htmlFor="name"
								>
									{i18n.t("Battery Health")}
								</label>
								<label
									className={styles["label-value"]}
									htmlFor="value"
								>
									{eventCode == "green" ||
									eventCode == "blue" ? (
										batteryLevel === undefined ? (
											"N/A"
										) : batteryLevel !== "" ? (
											<BatteryLevel
												batteryLevel={batteryLevel}
											/>
										) : (
											"N/A"
										)
									) : (
										i18n.t("N/A")
									)}
								</label>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export default AdherenceCalendar;
