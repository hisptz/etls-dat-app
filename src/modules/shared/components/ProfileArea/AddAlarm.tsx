import React from "react";
import {
	Button,
	Modal,
	ModalTitle,
	ModalContent,
	ModalActions,
	ButtonStrip,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
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

export const daysInWeek: Option[] = [
	{ name: "Sunday", code: "1" },
	{ name: "Monday", code: "2" },
	{ name: "Tuesday", code: "3" },
	{ name: "Wednesday", code: "4" },
	{ name: "Thursday", code: "5" },
	{ name: "Friday", code: "6" },
	{ name: "Saturday", code: "7" },
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

	return (
		<div>
			<Modal position="middle" hide={hide} onClose={onClose}>
				<ModalTitle>
					<h3
						className="m-0"
						style={{ marginBottom: "16px", fontWeight: "500" }}
					>
						{i18n.t("Set Device Alarm")}
					</h3>
				</ModalTitle>
				<ModalContent>
					<FormProvider {...form}>
						<div
							style={{
								height: "300px",
							}}
						>
							{frequency == "Weekly" ? (
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
											label={i18n.t(
												"Select Day of the Dose",
											)}
											options={daysInWeek}
											name="dayInWeek"
											type="select"
										/>
									</div>
									<FilterField
										label={i18n.t("Time")}
										name="nextDoseTime"
										type="time"
									/>
								</div>
							) : frequency == "Daily" ? (
								<div
									style={{
										marginBottom: "20px",
									}}
								>
									<FilterField
										label={i18n.t("Next Dose Time")}
										name="nextDoseTime"
										type="time"
										width="300px"
									/>
								</div>
							) : null}

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
							{i18n.t("Hide")}
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
