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
import { AddDevice } from "../../state";
import { FilterField } from "../../../Configuration/components/ProgramMapping/components/FilterField";
import { useSetting } from "@dhis2/app-service-datastore";
import { deviceEmeiList } from "../../constants";
import { useAssignDevice } from "../utils/assignDevice";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDataQuery } from "@dhis2/app-runtime";

interface editDeviceProps {
	name: string;
	value: string;
	refetch: () => void;
}

const schema = z.object({
	emei: z
		.string({ required_error: "Device IMEI number is required" })
		.nonempty("Device IMEI number is required"),
});

export type DeviceData = z.infer<typeof schema>;

function EditDevice({ name, value, refetch }: editDeviceProps) {
	const [hide, setHide] = useRecoilState<boolean>(AddDevice);
	const [devices, { set: updateDevice }] = useSetting("deviceEmeiList", {
		global: true,
	});
	const [availableDevices, setAvailableDevices] =
		useState<deviceEmeiList[]>();
	const { loading, assignDevice } = useAssignDevice();

	useEffect(() => {
		setAvailableDevices(
			devices.filter(
				(device: deviceEmeiList) =>
					!device.inUse || device.emei === value,
			),
		);
	}, []);

	const onSave = async (data: DeviceData) => {
		if (data) {
			const updatedDevices = devices.map((device: deviceEmeiList) => ({
				...device,
				inUse:
					device.emei === data.emei
						? true
						: device.emei === value && value !== data.emei
						? false
						: device.inUse,
			}));
			assignDevice(data.emei);
			setHide(true);
			updateDevice(updatedDevices);
		}
	};

	const onClose = async () => {
		form.reset();
		setHide(true);
	};
	const onSubmit = async (data: DeviceData) => {
		await onSave(data);
		refetch();
		form.reset();
	};

	const form = useForm<DeviceData>({
		defaultValues: async () => {
			return new Promise((resolve) => resolve({ emei: value }));
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
								name="emei"
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

export default EditDevice;
