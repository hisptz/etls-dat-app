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
import { useRecoilState } from "recoil";
import { AddAlarm } from "../../state";
import { FilterField } from "../../../Configuration/components/ProgramMapping/components/FilterField";
import { useSetting } from "@dhis2/app-service-datastore";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface addAlarmProps {
	nextRefillAlarm: string;
	nextRefillDate: string;
}

const schema = z.object({
	nextRefillDate: z
		.string({ required_error: "Next Refill Date is required" })
		.nonempty("Next Refill Date is required"),
	nextRefillAlarm: z
		.string({ required_error: "Next Refill Date is required" })
		.nonempty("Next Refill Alarm is required"),
});

export type AlarmFormData = z.infer<typeof schema>;

function EditAlarm({ nextRefillAlarm, nextRefillDate }: addAlarmProps) {
	const [hide, setHide] = useRecoilState<boolean>(AddAlarm);
	const [devices, { set: updateDevice }] = useSetting("deviceEmeiList", {
		global: true,
	});

	const onSubmit = async (data: AlarmFormData) => {
		setHide(true);
		onClose();
	};

	const onClose = async () => {
		form.reset({});
		setHide(true);
	};

	const form = useForm<AlarmFormData>({
		defaultValues: async () => {
			return new Promise((resolve) =>
				resolve({
					nextRefillDate: nextRefillDate,
					nextRefillAlarm: nextRefillAlarm,
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
										name="nextRefillDate"
										type="date"
									/>
								</div>
								<FilterField
									label={i18n.t("Alarm")}
									name="nextRefillAlarm"
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
