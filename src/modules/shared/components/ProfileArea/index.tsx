import i18n from "@dhis2/d2-i18n";
import styles from "./ProfileArea.module.css";
import { Button, IconEdit24, Card, ButtonStrip, IconClock24 } from "@dhis2/ui";
import React, { useEffect, useState } from "react";
import EditDevice from "./EditDevice";
import { PatientProfile } from "../../models";
import EditAlarm from "./AddAlarm";
import NoDeviceAssigned from "./NoDeviceAssigned";
import { DateTime } from "luxon";
import { useAdherenceEvents } from "./utils";
import { useSetting } from "@dhis2/app-service-datastore";
import { useSearchParams } from "react-router-dom";

export interface ProfileAreaProps {
	profile: PatientProfile;
	refetch: () => void;
	refetchDevice: () => void;
	data: any;
	loading: boolean;
}

export function ProfileArea({
	profile,
	refetch,
	refetchDevice,
	data,
	loading,
}: ProfileAreaProps) {
	const [hide, setHideDevice] = useState<boolean>(true);
	const [params] = useSearchParams();
	const [hideAlarm, setHideAlarm] = useState<boolean>(true);
	const [nextRefillDate, setNextRefillDate] = useState<string>("");
	const [nextRefillTime, setNextRefillTime] = useState<string>("");
	const [nextDoseTime, setNextDoseTime] = useState<string>("");
	const [dayInweek, setDayInWeek] = useState<string>("");
	const [programMapping] = useSetting("programMapping", {
		global: true,
	});
	const currentProgram = params.get("program");

	const selectedProgram = programMapping.filter(
		(mapping: any) => mapping.name === currentProgram,
	);
	const program = selectedProgram[0];

	const { filteredEvents } = useAdherenceEvents(
		profile.events,
		program?.programStage,
	);

	const onHide = () => {
		setHideDevice(true);
	};

	const onHideAlarm = () => {
		setHideAlarm(true);
	};

	const takenDoses = filteredEvents.filter((item: any) => {
		return item.dataValues.some((dataValue: any) => {
			const value = dataValue.value;
			return value === "Once" || value === "Multiple";
		});
	});

	const totalOpenings = takenDoses.length;

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

	const batteryLevel = data?.batteryLevel ?? "N/A";

	return loading ? (
		<></>
	) : (
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
									<h2 className=" m-0">
										{i18n.t("Patient Summary")}
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
										{i18n.t("Patient Number")}
									</label>
									<label
										className={styles["label-value"]}
										htmlFor="value"
									>
										{profile.patientNumber}
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
										setNextRefillDate(
											DateTime.fromFormat(
												data?.refillAlarm ?? "",
												"yyyy-MM-dd HH:mm:ss",
											).toFormat("yyyy-MM-dd") ?? "",
										);
										setNextRefillTime(
											DateTime.fromFormat(
												data?.refillAlarm ?? "",
												"yyyy-MM-dd HH:mm:ss",
											).toFormat("HH:mm") ?? "",
										);
										setNextDoseTime(
											DateTime.fromFormat(
												data?.alarmTime ?? "",
												"HH:mm:ss",
											).toFormat("HH:mm") ?? "",
										);
										setDayInWeek(data?.alarmDays ?? "");
									}}
								>
									{i18n.t("Set Alarm")}
								</Button>
							)}
						</ButtonStrip>
					</div>
					{profile.deviceIMEINumber == "N/A" ? (
						<NoDeviceAssigned
							title={i18n.t("Missing Device Information")}
							message={
								<span>
									<span style={{ fontWeight: "600" }}>
										{profile.name}
									</span>
									{i18n.t(" has no linked DAT Device")}
								</span>
							}
						/>
					) : (
						<div className={styles["profile"]}>
							<div className={styles["profile-container"]}>
								<div className={styles["grid-item"]}>
									<label
										className={styles["label-title"]}
										htmlFor="name"
									>
										{i18n.t("Assigned Device")}
									</label>
									<label
										className={styles["label-value"]}
										htmlFor="value"
									>
										{profile.deviceIMEINumber}
									</label>
								</div>
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
										{totalOpenings}
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
										{batteryLevel}
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
										{doseAlarm != "Invalid DateTime"
											? doseAlarm
											: "N/A"}
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
										{refillAlarm != "Invalid DateTime"
											? refillAlarm
											: "N/A"}
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
										{lastUpdated != "Invalid DateTime"
											? lastUpdated
											: "N/A"}
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
					patientId={profile.patientNumber}
					refetch={refetch}
					hide={hide}
					onHide={onHide}
				/>
			)}
			{!hideAlarm && (
				<EditAlarm
					nextRefillDate={
						nextRefillDate != "Invalid DateTime"
							? nextRefillDate
							: ""
					}
					nextRefillTime={
						nextRefillTime != "Invalid DateTime"
							? nextRefillTime
							: ""
					}
					dayInWeek={dayInweek}
					nextDoseTime={
						nextDoseTime != "Invalid DateTime" ? nextDoseTime : ""
					}
					refetch={refetchDevice}
					hide={hideAlarm}
					onHide={onHideAlarm}
					device={profile.deviceIMEINumber}
					frequency={profile.adherenceFrequency}
				/>
			)}
		</div>
	);
}
