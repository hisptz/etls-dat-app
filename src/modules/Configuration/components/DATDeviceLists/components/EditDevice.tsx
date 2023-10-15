import React, { useEffect, useState } from "react";
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
import { add, edit } from "../state";
import { useSearchParams } from "react-router-dom";
import { getDefaultFilters } from "../../constants/filters";
import { useSetting } from "@dhis2/app-service-datastore";
import { deviceEmeiList } from "../../../../shared/constants";
import { FormProvider, useForm } from "react-hook-form";
import { readXLSXFile } from "../hooks/data";

const EditDevice = ({ emei }: { emei?: string }) => {
	const [hide, setHide] = useRecoilState<boolean>(edit);
	const [addNew, setAdd] = useRecoilState<boolean>(add);
	const [bulkUpload, setBulkUpload] = useState<boolean>(false);
	const [disabled, setDisabled] = useState<boolean>(true);
	const [deviceFile, setDeviceFile] = useState<File>();
	const [excelFile, setExcelFile] = useState<{ imeiNumbers: [object] }>();
	const [params, setParams] = useSearchParams();
	const [devices, { set: addDevice }] = useSetting("deviceEmeiList", {
		global: true,
	});
	const deviceEMInumber = params.get("deviceEMInumber");
	const [showSuccess, setShowSuccess] = useState<boolean>(false);

	useEffect(() => {
		setDisabled(!deviceEMInumber);
	}, [deviceEMInumber]);

	const onResetClick = () => {
		const defaultValue = getDefaultFilters();
		setParams(defaultValue);
	};
	const methods = useForm();

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

	const onSave = () => {
		if (deviceEMInumber && !bulkUpload) {
			const newDevice = createDeviceFromEMINumber(deviceEMInumber);
			const updatedDevices = [...devices, newDevice];
			updateDeviceListAndShowSuccess(updatedDevices);
		} else if (excelFile) {
			const devicesFromExcel = excelFile.imeiNumbers.map(
				(deviceEMInumber: any) =>
					createDeviceFromEMINumber(
						deviceEMInumber["9.34022E+11"].toString(),
					),
			);
			const updatedDevices = [...devices, ...devicesFromExcel];
			updateDeviceListAndShowSuccess(updatedDevices);
		}
	};

	const onEdit = () => {
		if (emei && deviceEMInumber) {
			const updatedDevices = devices.map((device: deviceEmeiList) =>
				device.emei === emei
					? {
							...device,
							emei: deviceEMInumber,
							code: deviceEMInumber,
							name: deviceEMInumber,
					  }
					: device,
			);
			updateDeviceListAndShowSuccess(updatedDevices);
		}
	};

	return (
		<div>
			<Modal
				position="middle"
				hide={hide}
				onClose={() => {
					setHide(true);
					setAdd(false);
					setBulkUpload(false);
					onResetClick();
				}}
			>
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
						{addNew && (
							<div>
								<SwitchField
									label={i18n.t("Bulk Upload")}
									name="bulkUpload"
									onChange={() => setBulkUpload(!bulkUpload)}
									checked={bulkUpload}
								/>
								<br />
								{bulkUpload && (
									<div>
										<FormProvider {...methods}>
											<RHFDHIS2FormField
												name="file"
												valueType="FILE_RESOURCE"
												label={
													deviceFile?.name ??
													i18n.t("Device file")
												}
												onChange={(val: File) => {
													setDeviceFile(val);
													setDisabled(false);
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
										</FormProvider>
										<br />
									</div>
								)}
							</div>
						)}
						{!bulkUpload && (
							<div>
								<FilterField
									label={i18n.t("Device IMEI number")}
									name="deviceEMInumber"
									type="text"
									initialValue={addNew ? undefined : emei}
								/>
								<label style={{ fontSize: "12px" }}>
									{i18n.t(
										"Add the EMEI number as seen on the device",
									)}
								</label>
							</div>
						)}
					</div>
				</ModalContent>
				<ModalActions>
					<ButtonStrip end>
						<Button
							onClick={() => {
								setHide(true);
								setAdd(false);
								setBulkUpload(false);
								onResetClick();
							}}
							secondary
						>
							{i18n.t("Hide")}
						</Button>
						<Button
							disabled={disabled}
							onClick={() => {
								addNew ? onSave() : onEdit();
								onResetClick();
							}}
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
						{i18n.t("Device updated successfully")}
					</AlertBar>
				</div>
			)}
		</div>
	);
};

export default EditDevice;
