import React, { useState } from "react";
import {
	Button,
	Modal,
	ModalTitle,
	ModalContent,
	ModalActions,
	Switch,
	ButtonStrip,
	Checkbox,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import styles from "./ProfileArea.module.css";
import { FilterField } from "../../../Configuration/components/ProgramMapping/components/FilterField";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSetAlarm } from "../utils/assignAlarm";
import { useAlert } from "@dhis2/app-runtime";

interface addAlarmProps {
	nextRefillTime: string;
	nextRefillDate: string;
	nextDoseTime: string;
	dayInWeek: string;
	hide: boolean;
	onHide: () => void;
	refetch: () => void;
	frequency: "Daily" | "Weekly" | "Monthly" | string;
	device: string;
}

export const daysInWeek: any = [
	{ name: "Sun", code: "1" },
	{ name: "Mon", code: "2" },
	{ name: "Tue", code: "3" },
	{ name: "Wed", code: "4" },
	{ name: "Thur", code: "5" },
	{ name: "Fri", code: "6" },
	{ name: "Sat", code: "7" },
];

function EditAlarm({
	nextRefillTime,
	nextRefillDate,
	dayInWeek,
	nextDoseTime,
	hide,
	onHide,
	refetch,
	frequency,
	device,
}: addAlarmProps) {
	const { setAlarm } = useSetAlarm();
	const [doseReminder, setDoseReminder] = useState<boolean>(false);
	const [appointmentReminder, setAppointmentReminder] =
		useState<boolean>(false);

	const schema = z.object({
		dayInWeek:
			frequency == "Weekly"
				? z
						.string({
							required_error: "Day of the Dose is required",
						})
						.nonempty("Day of the Dose is required")
				: z.string(),
		nextDoseTime:
			frequency == "Monthly"
				? z.string()
				: z
						.string({
							required_error: "Next Dose Time is required",
						})
						.nonempty("Next Dose Time is required"),
		nextRefillDate: z
			.string({ required_error: "Next Refill Date is required" })
			.nonempty("Next Refill Date is required"),
		nextRefillTime: z
			.string({ required_error: "Next Refill Time is required" })
			.nonempty("Next Refill Time is required"),
	});

	type AlarmFormData = z.infer<typeof schema>;

	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 4000 }),
	);

	const dayIndex = dayInWeek.indexOf("1");
	const selectedDay = daysInWeek[dayIndex]?.code;

	function generateDays(selectedCode: string) {
		const codeArray = Array(7).fill("0");
		const selectedIndex = daysInWeek.findIndex(
			(day) => day.code === selectedCode,
		);

		if (selectedIndex !== -1) {
			codeArray[selectedIndex] = "1";
		}
		const codeString = codeArray.join("");

		return codeString;
	}

	const onSubmit = async (data: AlarmFormData) => {
		const alarmData = {
			imei: device,
			alarm: frequency != "Monthly" ? data.nextDoseTime : null,
			refillAlarm: data.nextRefillDate + " " + data.nextRefillTime,
			days:
				frequency == "Daily"
					? "1111111"
					: frequency == "Weekly"
					? generateDays(data.dayInWeek)
					: null,
		};

		await setAlarm({ data: alarmData }).then(async (res) => {
			if (res.response) {
				show({
					message: `Alarm for ${device} has been set successfully`,
					type: { success: true },
				});
				await onClose();
				refetch();
			}

			if (res.error) {
				show({
					message: `Could not update: ${res.error.response.data.message}`,
					type: { info: true },
				});
			}
		});
	};

	const onClose = async () => {
		form.reset({});
		onHide();
	};

	const form = useForm<AlarmFormData>({
		defaultValues: {
			nextRefillDate: nextRefillDate,
			nextRefillTime: nextRefillTime,
			dayInWeek: selectedDay,
			nextDoseTime: nextDoseTime,
		},
		resolver: zodResolver(schema),
	});

	const alarmDays = (day: string, checked: boolean) => {
		return (
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					paddingRight: "20px",
				}}
			>
				<Checkbox
					checked={checked}
					onChange={() => {
						null;
					}}
				/>
				<span style={{ marginTop: "2px" }}>{i18n.t(day)}</span>
			</div>
		);
	};

	return (
		<div>
			<Modal position="middle" hide={hide} onClose={onClose}>
				<ModalTitle>
					<h3
						className="m-0"
						style={{ marginBottom: "14px", fontWeight: "500" }}
					>
						{i18n.t("Set Alarms")}
					</h3>
				</ModalTitle>
				<ModalContent>
					<FormProvider {...form}>
						<div
							style={{
								height: "350px",
							}}
						>
							<div
								style={{
									display: "flex",
									flexDirection: "row",
									justifyContent: "flex-start",
									alignItems: "start",
								}}
							>
								<Switch
									checked={doseReminder}
									onChange={() => {
										setDoseReminder(!doseReminder);
									}}
								/>
								<div
									style={{
										display: "flex",
										flexDirection: "column",
									}}
								>
									<span
										className="m-0"
										style={{
											marginBottom: "5px",
											fontWeight: "400",
											fontSize: "24px",
										}}
									>
										{i18n.t("Dose Reminder")}
									</span>
									<span
										className="m-0"
										style={{
											marginBottom: "16px",
											fontWeight: "300",
											fontSize: "16px",
											fontStyle: "italic",
										}}
									>
										{i18n.t(
											"Set a daily or weekly alarm based on the appropriate treatment regimen",
										)}
									</span>
								</div>
							</div>
							<div
								style={{
									display: "flex",
									flexDirection: "row",
								}}
							>
								<FilterField
									label={i18n.t("Alarm Time")}
									name="nextDoseTime"
									type="time"
									width="170px"
								/>
								<div
									style={{
										width: "350px",
										marginBottom: "20px",
										marginLeft: "20px",
									}}
								>
									<span
										style={{
											fontSize: "14px",
											color: "#212934",
										}}
									>
										{i18n.t("Alarm Day(s)")}
									</span>
									<div
										style={{
											display: "flex",
										}}
									>
										{daysInWeek.map((day: any) => {
											return alarmDays(
												day.name,
												day.code,
											);
										})}
									</div>
								</div>
							</div>

							<div
								style={{
									display: "flex",
									flexDirection: "row",
									justifyContent: "flex-start",
									alignItems: "start",
									marginTop: "20px",
								}}
							>
								<Switch
									checked={appointmentReminder}
									onChange={() => {
										setAppointmentReminder(
											!appointmentReminder,
										);
									}}
								/>
								<div
									style={{
										display: "flex",
										flexDirection: "column",
									}}
								>
									<span
										className="m-0"
										style={{
											marginBottom: "5px",
											fontWeight: "400",
											fontSize: "24px",
										}}
									>
										{i18n.t("Appointment Reminder")}
									</span>
									<span
										className="m-0"
										style={{
											marginBottom: "16px",
											fontWeight: "300",
											fontSize: "16px",
											fontStyle: "italic",
										}}
									>
										{i18n.t(
											"Set a reminder for an upcoming appointment or refill. Each new reminder must be set manually",
										)}
									</span>
								</div>
							</div>

							<div
								style={{
									display: "flex",
									flexDirection: "row",
								}}
							>
								<div
									style={{
										width: "350px",
										marginBottom: "20px",
										marginRight: "10px",
									}}
								>
									<FilterField
										label={i18n.t("Next Refill Date")}
										name="nextRefillDate"
										type="date"
									/>
								</div>
								<FilterField
									label={i18n.t("Time")}
									name="nextRefillTime"
									type="time"
								/>
							</div>
						</div>
					</FormProvider>
				</ModalContent>
				<ModalActions>
					<ButtonStrip end>
						<Button onClick={onClose} secondary>
							{i18n.t("Cancel")}
						</Button>
						<Button
							loading={form.formState.isSubmitting}
							onClick={form.handleSubmit(onSubmit)}
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
