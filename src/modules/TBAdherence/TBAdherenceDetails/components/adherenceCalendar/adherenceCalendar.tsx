import React from "react";
import i18n from "@dhis2/d2-i18n";
import styles from "./adherenceCalendar.module.css";
import { PatientProfile } from "../../../../shared/models";

export interface ProfileAreaProps {
	profile: PatientProfile;
}

function AdherenceCalendar({ profile }: ProfileAreaProps) {
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
					flex: "3",
					marginRight: "12px",
				}}
			></div>
			<div
				style={{
					flex: "1",
					height: "auto",
					padding: "32px",
				}}
			>
				<label className={styles["label-value"]} htmlFor="value">
					<h3> {i18n.t("Records as per: Oct 4, 2023")}</h3>
				</label>
				<div className={styles["profile-container"]}>
					<div className={styles["grid-item"]}>
						<label className={styles["label-title"]} htmlFor="name">
							{i18n.t("Summary")}
						</label>
						<label
							className={styles["label-value"]}
							htmlFor="value"
						>
							{i18n.t(
								`${profile.name} was enrolled into the system`
							)}
						</label>
					</div>
					<div className={styles["grid-item"]}>
						<label className={styles["label-title"]} htmlFor="name">
							{i18n.t("Enrollment time")}
						</label>
						<label
							className={styles["label-value"]}
							htmlFor="value"
						>
							{i18n.t("Oct 4, 2023 10:45PM")}
						</label>
					</div>
					<div className={styles["grid-item"]}>
						<label className={styles["label-title"]} htmlFor="name">
							{i18n.t("Device Health")}
						</label>
						<label
							className={styles["label-value"]}
							htmlFor="value"
						>
							{i18n.t("Very good")}
						</label>
					</div>
					<div className={styles["grid-item"]}>
						<label className={styles["label-title"]} htmlFor="name">
							{i18n.t("Battery Health")}
						</label>
						<label
							className={styles["label-value"]}
							htmlFor="value"
						>
							{i18n.t("100%")}
						</label>
					</div>
				</div>
			</div>
		</div>
	);
}

export default AdherenceCalendar;
