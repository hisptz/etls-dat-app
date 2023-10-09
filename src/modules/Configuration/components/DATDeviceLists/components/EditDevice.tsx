import React, { useEffect, useState } from "react";
import {
	Button,
	Modal,
	ModalTitle,
	ModalContent,
	ModalActions,
	ButtonStrip,
	SwitchField,
	FileInputField,
	FileListItem,
	AlertBar,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { useRecoilState } from "recoil";
import { FilterField } from "../../ProgramMapping/components/FilterField";
import { add, edit } from "../state";
import { useSearchParams } from "react-router-dom";
import { getDefaultFilters } from "../../constants/filters";
import { useSetting } from "@dhis2/app-service-datastore";
import { deviceEmeiList } from "../../../../shared/constants";

const EditDevice = ({ emei }: { emei?: string }) => {
	const [hide, setHide] = useRecoilState<boolean>(edit);
	const [addNew, setAdd] = useRecoilState<boolean>(add);
	const [bulkUpload, setBulkUpload] = useState<boolean>(false);
	const [disabled, setDisabled] = useState<boolean>(true);
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

	const onSave = () => {
		if (deviceEMInumber) {
			const newDevice = {
				name: deviceEMInumber,
				code: deviceEMInumber,
				emei: deviceEMInumber,
				inUse: false,
			};

			const updatedDevices = [...devices, newDevice];
			setHide(true);
			setAdd(false);
			addDevice(updatedDevices);
			setShowSuccess(true);
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
			setHide(true);
			addDevice(updatedDevices);
			setAdd(false);
			setShowSuccess(true);
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
										<FileInputField
											helpText={i18n.t(
												"Add an excel file with a list of devices only",
											)}
											label={i18n.t("Device File")}
											accept=".xlsx"
											name={"IMEI"}
											onChange={(val: {
												name: string;
												files: [];
											}) => {
												console.log(val.files);
											}}
										>
											<FileListItem
												label="IMEI.xlsx"
												onRemove={() => null}
												removeText="remove"
											/>
										</FileInputField>
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
