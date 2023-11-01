import i18n from "@dhis2/d2-i18n";
import styles from "./ProfileArea.module.css";
import { Button, IconEdit24, Card, ButtonStrip, IconClock24 } from "@dhis2/ui";
import React, { useEffect } from "react";
import EditDevice from "./EditDevice";
import { PatientProfile } from "../../models";
import { useRecoilState } from "recoil";
import { AddAlarm, AddDevice } from "../../state";
import EditAlarm from "./AddAlarm";
import NoDeviceAssigned from "./NoDeviceAssigned";
import { useDataQuery } from "@dhis2/app-runtime";
import { useDeviceData } from "./utils";

export interface ProfileAreaProps {
	profile: PatientProfile;
	refetch: () => void;
}

export function ProfileArea({ profile, refetch }: ProfileAreaProps) {
	const [hide, setHideDevice] = useRecoilState<boolean>(AddDevice);
	const [hideAlarm, setHideAlarm] = useRecoilState<boolean>(AddAlarm);
	const { data, error, loading } = useDeviceData(profile.deviceIMEINumber);

	// useEffect(() => {
	// 	if (loading) {
	// 		console.log(loading);
	// 	} else if (error) {
	// 		console.log(error);
	// 	} else if (data) {
	// 		console.log(data);
	// 	}
	// }, [data, error, loading]);

	return (
		<div>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					justifyItems: "stretch",
					alignItems: "stretch",
					gap: 16,
				}}
			>
				<Card>
					<div className={styles["profile-area"]}>
						<div className="row space-between gap-32 align-center">
							<div
								style={{ alignItems: "flex-end" }}
								className="row"
							>
								<div>
									<h2
										className=" m-0"
										style={{ marginBottom: "16px" }}
									>
										{i18n.t("TB Client")}
									</h2>
								</div>
							</div>
						</div>
						<div className={styles["profile"]}>
							<div className={styles["profile-container"]}>
								<div className={styles["grid-item"]}>
									<label
										className={styles["label-title"]}
										htmlFor="name"
									>
										{i18n.t("TB District Number")}
									</label>
									<label
										className={styles["label-value"]}
										htmlFor="value"
									>
										{profile.tbDistrictNumber}
									</label>
								</div>
								<div
									className={styles["grid-item"]}
									style={{ width: "170px" }}
								>
									<label
										className={styles["label-title"]}
										htmlFor="name"
									>
										{i18n.t("Name")}
									</label>
									<label
										className={styles["label-value"]}
										htmlFor="value"
									>
										{profile.name.toUpperCase()}
									</label>
								</div>
								<div className={styles["grid-item"]}>
									<label
										className={styles["label-title"]}
										htmlFor="name"
									>
										{i18n.t("Age")}
									</label>
									<label
										className={styles["label-value"]}
										htmlFor="value"
									>
										{profile.age}
									</label>
								</div>
								<div className={styles["grid-item"]}>
									<label
										className={styles["label-title"]}
										htmlFor="name"
									>
										{i18n.t("Sex")}
									</label>
									<label
										className={styles["label-value"]}
										htmlFor="value"
									>
										{profile.sex}
									</label>
								</div>

								<div className={styles["grid-item"]}>
									<label
										className={styles["label-title"]}
										htmlFor="name"
									>
										{i18n.t("Adherence Frequency")}
									</label>
									<label
										className={styles["label-value"]}
										htmlFor="value"
									>
										{profile.adherenceFrequency}
									</label>
								</div>

								<div className={styles["grid-item"]}>
									<label
										className={styles["label-title"]}
										htmlFor="name"
									>
										{i18n.t("Phone")}
									</label>
									<label
										className={styles["label-value"]}
										htmlFor="value"
									>
										{profile.phoneNumber}
									</label>
								</div>
							</div>
						</div>
					</div>
				</Card>
				<Card className={styles["profile-area"]}>
					<div
						className="row space-between gap-32 align-center"
						style={{ marginBottom: "16px" }}
					>
						<div style={{ alignItems: "flex-end" }} className="row">
							<div>
								<h2 className=" m-0">
									{i18n.t("DAT device information")}
								</h2>
							</div>
						</div>
						<ButtonStrip>
							<Button
								secondary
								icon={<IconEdit24 />}
								onClick={() => {
									setHideDevice(false);
								}}
							>
								{i18n.t("Edit Device")}
							</Button>
							{profile.deviceIMEINumber == "N/A" ? null : (
								<Button
									secondary
									icon={<IconClock24 />}
									onClick={() => {
										setHideAlarm(false);
									}}
								>
									{i18n.t("Set Alarm")}
								</Button>
							)}
						</ButtonStrip>
					</div>
					{profile.deviceIMEINumber == "N/A" ? (
						<NoDeviceAssigned
							message={`${profile.name} has no linked DAT Device`}
						/>
					) : (
						<div className={styles["profile"]}>
							<div className={styles["profile-container"]}>
								<div className={styles["grid-item"]}>
									<label
										className={styles["label-title"]}
										htmlFor="name"
									>
										{i18n.t("Total Openings")}
									</label>
									<label
										className={styles["label-value"]}
										htmlFor="value"
									>
										{i18n.t("39")}
									</label>
								</div>
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
										{profile.deviceHealth}
									</label>
								</div>
								<div className={styles["grid-item"]}>
									<label
										className={styles["label-title"]}
										htmlFor="name"
									>
										{i18n.t("Battery Level")}
									</label>
									<label
										className={styles["label-value"]}
										htmlFor="value"
									>
										{profile.batteryHealth}
									</label>
								</div>
								<div className={styles["grid-item"]}>
									<label
										className={styles["label-title"]}
										htmlFor="name"
									>
										{i18n.t("Next dose Alarm")}
									</label>
									<label
										className={styles["label-value"]}
										htmlFor="value"
									>
										{profile.dosageTime}
									</label>
								</div>

								<div className={styles["grid-item"]}>
									<label
										className={styles["label-title"]}
										htmlFor="name"
									>
										{i18n.t("Next refill Alarm")}
									</label>
									<label
										className={styles["label-value"]}
										htmlFor="value"
									>
										{" "}
										{i18n.t("Next refill Alarm")}{" "}
									</label>
								</div>

								<div className={styles["grid-item"]}>
									<label
										className={styles["label-title"]}
										htmlFor="name"
									>
										{i18n.t("Last updated")}
									</label>
									<label
										className={styles["label-value"]}
										htmlFor="value"
									>
										{i18n.t("Last updated")}
									</label>
								</div>
							</div>
						</div>
					)}
				</Card>
			</div>
			{!hide && (
				<EditDevice
					value={
						profile.deviceIMEINumber == "N/A"
							? ""
							: profile.deviceIMEINumber
					}
					name={profile.name}
					refetch={refetch}
				/>
			)}
			{!hideAlarm && <EditAlarm nextRefillDate="" nextRefillAlarm="" />}
		</div>
	);
}
