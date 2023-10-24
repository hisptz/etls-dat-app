import React, { useState } from "react";
import i18n from "@dhis2/d2-i18n";
import styles from "./adherenceCalendar.module.css";
import { PatientProfile } from "../../../../shared/models";
import Calendar, { DateEvent } from "./components/calendar";
import NoDeviceAssigned from "../../../../shared/components/ProfileArea/NoDeviceAssigned";

export interface ProfileAreaProps {
	profile: PatientProfile;
}

function AdherenceCalendar({ profile }: ProfileAreaProps) {
	const formatDateWithTime = (date: Date) => {
		const options = {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		};
		return date.toLocaleDateString(undefined, options);
	};
	const formatDate = (date: Date) => {
		const options = {
			year: "numeric",
			month: "short",
			day: "numeric",
		};
		return date.toLocaleDateString(undefined, options);
	};
	const [formattedDate, setFormattedDate] = useState<string>();
	const [formattedDateWithTime, setFormattedDateWithTime] =
		useState<string>();

	const [eventCode, setEventCode] = useState<string>();

	const events: DateEvent[] = [
		{
			date: "2023-08-07",
			event: "takenDose",
		},
		{
			date: "2023-09-20",
			event: "notTakenDose",
		},
		{
			date: "2023-09-30",
			event: "takenDose",
		},
		{
			date: "2023-10-01",
			event: "enrolled",
		},
		{
			date: "2023-10-18",
			event: "takenDose",
		},
		{
			date: "2023-11-30",
			event: "notTakenDose",
		},

		{
			date: "2023-10-31",
			event: "notTakenDose",
		},
	];
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
						message={`${profile.name} has no dose data recorded`}
					/>
				) : (
					<>
						{" "}
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
												? i18n.t(
														formattedDateWithTime ??
															"",
												  )
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
									{i18n.t("Device Health")}
								</label>
								<label
									className={styles["label-value"]}
									htmlFor="value"
								>
									{eventCode == "green" || eventCode == "blue"
										? i18n.t(profile.deviceHealth ?? "")
										: i18n.t("N/A")}
								</label>
							</div>
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
									{eventCode == "green" || eventCode == "blue"
										? i18n.t(profile.batteryHealth ?? "")
										: i18n.t("N/A")}
								</label>
							</div>
						</div>{" "}
					</>
				)}
			</div>
		</div>
	);
}

export default AdherenceCalendar;
