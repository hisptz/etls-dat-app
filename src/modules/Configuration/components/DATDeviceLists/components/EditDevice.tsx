import React, { useState } from "react";
import {
	Button,
	Modal,
	ModalTitle,
	ModalContent,
	ModalActions,
	ButtonStrip,
	SwitchField,
	AlertBar,
} from "@dhis2/ui";
import { RHFDHIS2FormField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { useRecoilState } from "recoil";
import { FilterField } from "../../ProgramMapping/components/FilterField";
import { add, editDevice } from "../state";

import { useSetting } from "@dhis2/app-service-datastore";
import { deviceEmeiList } from "../../../../shared/constants";
import { FormProvider, useForm } from "react-hook-form";
import { readXLSXFile } from "../hooks/data";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
	emei: z
		.string({ required_error: "Device IMEI number is required" })
		.nonempty("Device IMEI number is required"),
	inUse: z.boolean().optional(),
	name: z.string().optional(),
	code: z.string().optional(),
});
const schema2 = z.object({});

export type DeviceFormData = z.infer<typeof schema>;

const EditDevice = ({ data }: { data?: DeviceFormData }) => {
	const [hide, setHide] = useRecoilState<boolean>(editDevice);
	const [addNew, setAdd] = useRecoilState<boolean>(add);
	const [bulkUpload, setBulkUpload] = useState<boolean>(false);
	const [deviceFile, setDeviceFile] = useState<File>();
	const [excelFile, setExcelFile] = useState<{ imeiNumbers: [object] }>();
	const [devices, { set: addDevice }] = useSetting("deviceEmeiList", {
		global: true,
	});
	const [showSuccess, setShowSuccess] = useState<boolean>(false);
	const [showError, setShowError] = useState<boolean>(false);

	const createDeviceFromEMINumber = (deviceEMInumber: string) => ({
		name: deviceEMInumber,
		code: deviceEMInumber,
		emei: deviceEMInumber,
		inUse: false,
	});

	const updateDeviceListAndShowSuccess = (updatedDevices: any) => {
		addDevice(updatedDevices);
		setHide(true);
		setAdd(false);
		setShowSuccess(true);
	};

	const onSave = async (deviceData: DeviceFormData) => {
		if (deviceData.emei && !bulkUpload) {
			const updatedDevices = [...devices, deviceData];
			const isDeviceAlreadyPresent = devices.some(
				(device: any) => device.emei === deviceData.emei,
			);
			isDeviceAlreadyPresent
				? setShowError(true)
				: updateDeviceListAndShowSuccess(updatedDevices);
		} else if (excelFile) {
			const devicesFromExcel = excelFile.imeiNumbers.map(
				(deviceEMInumber: any) =>
					createDeviceFromEMINumber(
						deviceEMInumber["devices"].toString(),
					),
			);
			const uniqueDevicesMap = new Map();

			devices.concat(devicesFromExcel).forEach((device: any) => {
				uniqueDevicesMap.set(device.emei, device);
			});
			const updatedDevices = [...uniqueDevicesMap.values()];
			updateDeviceListAndShowSuccess(updatedDevices);
		}
	};

	const onEdit = async (deviceData: DeviceFormData) => {
		if (data?.emei && deviceData.emei) {
			const updatedDevices = devices.map((device: deviceEmeiList) =>
				device.emei === data.emei
					? {
							...device,
							emei: deviceData.emei,
							code: deviceData.code,
							name: deviceData.name,
					  }
					: device,
			);
			updateDeviceListAndShowSuccess(updatedDevices);
		}
	};

	const onClose = () => {
		setHide(true);
		setAdd(false);
		setBulkUpload(false);
		form.reset({});
	};

	const onSubmit = async (data: DeviceFormData) => {
		data.code = data.emei;
		data.inUse = false;
		data.name = data.emei;
		addNew ? await onSave(data) : await onEdit(data);
		form.reset({});
	};

	const form = useForm<DeviceFormData>({
		defaultValues: async () => {
			return new Promise((resolve) =>
				resolve(
					addNew
						? {}
						: {
								emei: data?.emei ?? "",
								code: data?.code,
								inUse: data?.inUse,
								name: data?.name,
						  },
				),
			);
		},
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
								<div
									onClick={() => {
										setShowError(false);
									}}
								>
									<FilterField
										label={i18n.t("Device IMEI number")}
										name="emei"
										type="text"
									/>
									<label style={{ fontSize: "12px" }}>
										{i18n.t(
											"Add the EMEI number as seen on the device",
										)}
									</label>
								</div>
							)}
							{showError ? (
								<label
									style={{
										fontSize: "14px",
										color: "red",
									}}
								>
									{i18n.t("Device already exists!")}
								</label>
							) : null}
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
			{showSuccess && (
				<div
					style={{
						position: "fixed",
						bottom: "0",
						left: "50%",
						transform: "translateX(-50%)",
					}}
				>
					<AlertBar
						duration={2000}
						onHidden={() => {
							setShowSuccess(!showSuccess);
						}}
					>
						{i18n.t("Devices updated successfully")}
					</AlertBar>
				</div>
			)}
		</div>
	);
};

export default EditDevice;
