import i18n from "@dhis2/d2-i18n";
import styles from "./ProfileArea.module.css";
import { Button, IconEdit24, Card } from "@dhis2/ui";
import React from "react";
import EditDevice from "./EditDevice";
import { SHARED_ATTRIBUTES } from "../../constants";
import { PatientProfile } from "../../models";
import { useRecoilState } from "recoil";
import { AddDevice } from "../../state";

export interface ProfileAreaProps {
	profile: PatientProfile;
}

export function ProfileArea({ profile }: ProfileAreaProps) {
	const [, setHide] = useRecoilState<boolean>(AddDevice);
	const sex =
		profile.sex == "M" ? "Male" : profile.sex == "F" ? "Female" : null;

	return (
		<div>
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					height: "200px",
				}}
			>
				<Card className={styles["profile-area"]}>
					<div className="row space-between gap-32 align-center">
						<div style={{ alignItems: "flex-end" }} className="row">
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
							<div
								className={styles["grid-item"]}
								style={{ width: "250px" }}
							>
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
									{sex}
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
								></label>
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
				</Card>
				<div style={{ margin: "5px" }}></div>
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
						<Button
							secondary
							icon={<IconEdit24 />}
							onClick={() => setHide(false)}
						>
							{i18n.t("Edit Device")}
						</Button>
					</div>
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
									{i18n.t("Very good")}
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
									{i18n.t("97%")}
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
								></label>
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
								></label>
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
								></label>
							</div>
						</div>
					</div>
				</Card>
			</div>
			<EditDevice
				options={[
					{
						name: profile.getAttributeValue(
							SHARED_ATTRIBUTES.DEVICE_NUMBER
						),
						code: profile.getAttributeValue(
							SHARED_ATTRIBUTES.DEVICE_NUMBER
						),
					},
				]}
				value={profile.getAttributeValue(
					SHARED_ATTRIBUTES.DEVICE_NUMBER
				)}
				name={profile.name}
			/>
		</div>
	);
}
