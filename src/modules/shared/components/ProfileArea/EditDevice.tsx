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
import { useSearchParams } from "react-router-dom";
import { useAssignDevice } from "../utils/assignDevice";

interface editDeviceProps {
	name: string;
	value: string;
	refetch?: () => void;
}

function EditDevice({ name, value, refetch }: editDeviceProps) {
	const [hide, setHide] = useRecoilState<boolean>(AddDevice);
	const [disabled, setDisabled] = useState<boolean>(true);
	const [devices, { set: updateDevice }] = useSetting("deviceEmeiList", {
		global: true,
	});
	const [params] = useSearchParams();
	const deviceEMInumber = params.get("deviceEMInumber");
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
		setDisabled(!deviceEMInumber);
	}, [deviceEMInumber]);

	const onSave = () => {
		if (deviceEMInumber) {
			const updatedDevices = devices.map((device: deviceEmeiList) => ({
				...device,
				inUse:
					device.emei === deviceEMInumber
						? true
						: device.emei === value && value !== deviceEMInumber
						? false
						: device.inUse,
			}));
			assignDevice();
			setHide(true);
			updateDevice(updatedDevices);
			!loading && refetch ? refetch() : null;
		}
	};
	return (
		<div>
			<Modal
				position="middle"
				hide={hide}
				onClose={() => {
					setHide(true);
				}}
			>
				<ModalTitle>
					<h3
						className="m-0"
						style={{ marginBottom: "16px", fontWeight: "500" }}
					>
						{i18n.t(`Assign DAT device to ${name}`)}
					</h3>
				</ModalTitle>
				<ModalContent>
					<div
						style={{
							height: "300px",
						}}
					>
						<FilterField
							label={i18n.t("Device IMEI number")}
							name={"deviceEMInumber"}
							initialValue={value}
							type="select"
							options={availableDevices}
						/>

						<label style={{ fontSize: "12px" }}>
							{i18n.t(
								"Assign the device number, or click clear to clear previous device",
							)}
						</label>
					</div>
				</ModalContent>
				<ModalActions>
					<ButtonStrip end>
						<Button
							onClick={() => {
								setHide(true);
							}}
							secondary
						>
							{i18n.t("Hide")}
						</Button>
						<Button
							disabled={disabled}
							onClick={() => {
								onSave();
							}}
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
