import React, { useState } from "react";
import {
	Button,
	Modal,
	ModalTitle,
	ModalContent,
	ModalActions,
	ButtonStrip,
	SwitchField,
} from "@dhis2/ui";
import { RHFDHIS2FormField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { useRecoilState } from "recoil";
import { FilterField } from "../../ProgramMapping/components/FilterField";
import { add } from "../state";

import { useSetting } from "@dhis2/app-service-datastore";
import { deviceIMEIList } from "../../../../shared/constants";
import { FormProvider, useForm } from "react-hook-form";
import { readXLSXFile } from "../hooks/data";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAlert } from "@dhis2/app-runtime";

const schema = z.object({
	IMEI: z
		.string({ required_error: "Device IMEI number is required" })
		.nonempty("Device IMEI number is required"),
	inUse: z.boolean().optional(),
	name: z.string().optional(),
	code: z.string().optional(),
});
const schema2 = z.object({});

export type DeviceFormData = z.infer<typeof schema>;

const EditDevice = ({
	data,
	hide,
	onHide,
	refresh,
}: {
	data?: DeviceFormData;
	hide: boolean;
	onHide: () => void;
	refresh: (newDevices?: any) => void;
}) => {
	const [addNew, setAdd] = useRecoilState<boolean>(add);
	const [bulkUpload, setBulkUpload] = useState<boolean>(false);
	const [deviceFile, setDeviceFile] = useState<File>();
	const [excelFile, setExcelFile] = useState<{ imeiNumbers: [object] }>();
	const [devices, { set: addDevice }] = useSetting("deviceIMEIList", {
		global: true,
	});

	const createDeviceFromIMEINumber = (deviceIMEInumber: string) => ({
		name: deviceIMEInumber,
		code: deviceIMEInumber,
		IMEI: deviceIMEInumber,
		inUse: false,
	});
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	const updateDeviceListAndShowSuccess = (updatedDevices: any) => {
		addDevice(updatedDevices);
		onHide();
		setAdd(false);
		refresh([...updatedDevices]);
		show({
			message: "Devices Updated Successfully",
			type: { success: true },
		});
	};

	const onSave = async (deviceData: DeviceFormData) => {
		if (deviceData.IMEI && !bulkUpload) {
			const updatedDevices = [...devices, deviceData];
			const isDeviceAlreadyPresent = devices.some(
				(device: any) => device.IMEI === deviceData.IMEI,
			);
			isDeviceAlreadyPresent
				? show({
						message: "Device Already Exists!",
						type: { error: true },
				  })
				: updateDeviceListAndShowSuccess(updatedDevices);
		} else if (excelFile) {
			const devicesFromExcel = excelFile.imeiNumbers.map(
				(deviceIMEInumber: any) =>
					createDeviceFromIMEINumber(
						deviceIMEInumber["devices"].toString(),
					),
			);

			const uniqueDevicesMap = new Map();

			devices.forEach((device: any) => {
				uniqueDevicesMap.set(device.IMEI, device);
			});

			devicesFromExcel.forEach((device) => {
				if (!uniqueDevicesMap.has(device.IMEI)) {
					uniqueDevicesMap.set(device.IMEI, device);
				}
			});

			const updatedDevices = [...uniqueDevicesMap.values()];
			updateDeviceListAndShowSuccess(updatedDevices);
		}
	};

	const onEdit = async (deviceData: DeviceFormData) => {
		if (data?.IMEI && deviceData.IMEI) {
			const updatedDevices = devices.map((device: deviceIMEIList) =>
				device.IMEI === data.IMEI
					? {
							...device,
							IMEI: deviceData.IMEI,
							code: deviceData.code,
							name: deviceData.name,
					  }
					: device,
			);
			updateDeviceListAndShowSuccess(updatedDevices);
		}
	};

	const onClose = () => {
		setAdd(false);
		setBulkUpload(false);
		onHide();
		form.reset({});
	};

	const onSubmit = async (data: DeviceFormData) => {
		data.code = data.IMEI;
		data.inUse = false;
		data.name = data.IMEI;
		addNew ? await onSave(data) : await onEdit(data);
		form.reset({});
	};

	const form = useForm<DeviceFormData>({
		defaultValues: data,
		resolver: zodResolver(bulkUpload ? schema2 : schema),
	});

	return (
		<div>
			<Modal position="middle" hide={hide} onClose={onClose}>
				<ModalTitle>
					<h3
						className="m-0"
						style={{ marginBottom: "10px", fontWeight: "500" }}
					>
						{i18n.t("DAT Device Form")}
					</h3>
				</ModalTitle>
				<ModalContent>
					<div style={{ height: "300px" }}>
						<FormProvider {...form}>
							{addNew && (
								<div>
									<SwitchField
										label={i18n.t("Bulk Upload")}
										name="bulkUpload"
										onChange={() =>
											setBulkUpload(!bulkUpload)
										}
										checked={bulkUpload}
									/>
									<br />
									{bulkUpload && (
										<div>
											<RHFDHIS2FormField
												name="file"
												valueType="FILE_RESOURCE"
												label={
													deviceFile?.name ??
													i18n.t("Device file")
												}
												onChange={(val: File) => {
													setDeviceFile(val);

													readXLSXFile(val).then(
														(result) => {
															setExcelFile(
																result,
															);
														},
													);
												}}
												helpText={i18n.t(
													"Add an excel file with the list of devices only",
												)}
												accept=".xlsx"
											/>

											<br />
										</div>
									)}
								</div>
							)}
							{!bulkUpload && (
								<div>
									<FilterField
										label={i18n.t("Device IMEI number")}
										name="IMEI"
										type="text"
									/>
									<label style={{ fontSize: "12px" }}>
										{i18n.t(
											"Add the IMEI number as seen on the device",
										)}
									</label>
								</div>
							)}
						</FormProvider>
					</div>
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
};

export default EditDevice;
