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
import { FilterField } from "../../../Configuration/components/ProgramMapping/components/FilterField";
import { useSetting } from "@dhis2/app-service-datastore";
import { DeviceIMEIList } from "../../constants";
import { useAssignDevice } from "../utils/assignDevice";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAlert } from "@dhis2/app-runtime";

interface editDeviceProps {
	patientId: string;
	name: string;
	value: string;
	refetch: () => void;
	hide: boolean;
	onHide: () => void;
}

const schema = z.object({
	IMEI: z
		.string({ required_error: "Device IMEI number is required" })
		.nonempty("Device IMEI number is required"),
});

export type DeviceData = z.infer<typeof schema>;

function EditDevice({
	name,
	value,
	patientId,
	refetch,
	hide,
	onHide,
}: editDeviceProps) {
	const [devices, { set: updateDevice }] = useSetting("deviceIMEIList", {
		global: true,
	});
	const [availableDevices, setAvailableDevices] =
		useState<DeviceIMEIList[]>();
	const { assignDevice, assignDeviceWisePill } = useAssignDevice();

	useEffect(() => {
		setAvailableDevices(
			devices.filter(
				(device: DeviceIMEIList) =>
					!device.inUse || device.IMEI === value,
			),
		);
	}, []);
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	const onSave = async (data: DeviceData) => {
		if (data) {
			const updatedDevices = devices.map((device: DeviceIMEIList) => ({
				...device,
				inUse:
					device.IMEI === data.IMEI
						? true
						: device.IMEI === value && value !== data.IMEI
						? false
						: device.inUse,
			}));

			await assignDeviceWisePill({
				imei: data.IMEI,
				patientId: patientId,
			}).then(async (response) => {
				if (response.response) {
					await assignDevice(data.IMEI).then(async (res) => {
						if (res?.updated != 0) {
							await updateDevice(updatedDevices).then(
								async () => {
									show({
										message: "Update successful",
										type: { success: true },
									});
									refetch();
								},
							);
						} else if (res.ignored != 0) {
							show({
								message: `Could not update: ${res.error[0].message}`,
								type: { info: true },
							});
						}
					});
				} else if (response.error) {
					show({
						message: `Could not update: ${response.error.response.data.message}`,
						type: { info: true },
					});
				}
			});
		}
	};

	const onClose = async () => {
		form.reset();
		onHide();
	};
	const onSubmit = async (data: DeviceData) => {
		await onSave(data);
		onHide();
		form.reset();
	};

	const form = useForm<DeviceData>({
		defaultValues: async () => {
			return new Promise((resolve) => resolve({ IMEI: value }));
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
						{i18n.t(`Assign DAT device to ${name}`)}
					</h3>
				</ModalTitle>
				<ModalContent>
					<FormProvider {...form}>
						<div
							style={{
								height: "300px",
							}}
						>
							<FilterField
								label={i18n.t("Device IMEI number")}
								name="IMEI"
								type="select"
								options={availableDevices}
							/>

							<label style={{ fontSize: "12px" }}>
								{i18n.t(
									"Assign the device number, or click clear to clear previous device",
								)}
							</label>
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

export default EditDevice;
