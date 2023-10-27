import React, { useEffect, useState } from "react";
import {
	Button,
	Modal,
	ModalTitle,
	ModalContent,
	ModalActions,
	ButtonStrip,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { useRecoilState } from "recoil";
import { AddAlarm, AddDevice } from "../../state";
import { FilterField } from "../../../Configuration/components/ProgramMapping/components/FilterField";
import { useSetting } from "@dhis2/app-service-datastore";
import { deviceEmeiList } from "../../constants";
import { useSearchParams } from "react-router-dom";
import { useAssignDevice } from "../utils/assignDevice";

interface addAlarmProps {
	nextDose: string;
	nextRefill: string;
}

function EditAlarm({ nextDose, nextRefill }: addAlarmProps) {
	const [hide, setHide] = useRecoilState<boolean>(AddAlarm);
	const [disabled, setDisabled] = useState<boolean>(true);
	const [devices, { set: updateDevice }] = useSetting("deviceEmeiList", {
		global: true,
	});
	const [params] = useSearchParams();
	const nextDoseDate = params.get("nextDoseDate");
	const nextDoseAlarm = params.get("nextDoseAlarm");
	const nextRefillDate = params.get("nextRefillDate");
	const nextRefillAlarm = params.get("nextRefillAlarm");

	useEffect(() => {
		setDisabled(!(nextRefillDate && nextRefillAlarm));
	}, [nextRefillDate, nextRefillAlarm]);

	const onSave = () => {
		if (nextRefillDate && nextRefillAlarm) {
			setHide(true);
		}
	};
	return (
		<div>
			<Modal
				position="middle"
				hide={hide}
				onClose={() => {
					setHide(true);
				}}
			>
				<ModalTitle>
					<h3
						className="m-0"
						style={{ marginBottom: "16px", fontWeight: "500" }}
					>
						{i18n.t("Set Device Alarm")}
					</h3>
				</ModalTitle>
				<ModalContent>
					<div
						style={{
							height: "300px",
						}}
					>
						{/* <div
							style={{
								display: "flex",
								flexDirection: "row",
							}}
						>
							<div
								style={{
									width: "300px",
									marginBottom: "20px",
									marginRight: "10px",
								}}
							>
								<FilterField
									label={i18n.t("Next Dose Date")}
									name={"nextDoseDate"}
									type="date"
								/>
							</div>
							<FilterField
								label={i18n.t("Alarm")}
								name={"nextDoseAlarm"}
								type="time"
							/>
						</div> */}
						<div
							style={{
								display: "flex",
								flexDirection: "row",
							}}
						>
							<div
								style={{
									width: "300px",
									marginBottom: "20px",
									marginRight: "10px",
								}}
							>
								<FilterField
									label={i18n.t("Next Refill Date")}
									name={"nextRefillDate"}
									type="date"
								/>
							</div>
							<FilterField
								label={i18n.t("Alarm")}
								name={"nextRefillAlarm"}
								type="time"
							/>
						</div>
					</div>
				</ModalContent>
				<ModalActions>
					<ButtonStrip end>
						<Button
							onClick={() => {
								setHide(true);
							}}
							secondary
						>
							{i18n.t("Hide")}
						</Button>
						<Button
							disabled={disabled}
							onClick={() => {
								onSave();
							}}
							primary
						>
							{i18n.t("Save")}
						</Button>
					</ButtonStrip>
				</ModalActions>
			</Modal>
		</div>
	);
}

export default EditAlarm;
