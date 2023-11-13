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
import { useSetting } from "@dhis2/app-service-datastore";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface addAlarmProps {
	nextRefillTime: string;
	nextRefillDate: string;
	nextDoseTime: string;
	nextDoseDate: string;
	hide: boolean;
	onHide: () => void;
	frequency: "Daily" | "Weekly" | "Monthly" | string;
}

const schema = z.object({
	dayInWeek: z.string(),
	nextDoseTime: z
		.string({ required_error: "Next Dose Time is required" })
		.nonempty("Next Dose Time is required"),
	nextRefillDate: z
		.string({ required_error: "Next Refill Date is required" })
		.nonempty("Next Refill Date is required"),
	nextRefillTime: z
		.string({ required_error: "Next Refill Time is required" })
		.nonempty("Next Refill Time is required"),
});

export type AlarmFormData = z.infer<typeof schema>;

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
	nextDoseDate,
	nextDoseTime,
	hide,
	onHide,
	frequency,
}: addAlarmProps) {
	const [devices, { set: updateDevice }] = useSetting("deviceIMEIList", {
		global: true,
	});

	const onSubmit = async (data: AlarmFormData) => {
		console.log(data);
		onHide();
		onClose();
	};

	const onClose = async () => {
		form.reset({});
		onHide();
	};

	const form = useForm<AlarmFormData>({
		defaultValues: async () => {
			return new Promise((resolve) =>
				resolve({
					nextRefillDate: nextRefillDate,
					nextRefillTime: nextRefillTime,
					dayInWeek: nextDoseDate,
					nextDoseTime: nextDoseTime,
				}),
			);
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
