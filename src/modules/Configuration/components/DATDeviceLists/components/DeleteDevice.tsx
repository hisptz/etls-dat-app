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
import { useSetting } from "@dhis2/app-service-datastore";
import { deviceIMEIList } from "../../../../shared/constants";
import { useAlert } from "@dhis2/app-runtime";

interface DeleteDevice {
	IMEI?: string;
	inUse?: boolean;
	hide: boolean;
	onHide: () => void;
}

function DeleteDevice({ IMEI, inUse, hide, onHide }: DeleteDevice) {
	const [devices, { set: deleteDevice }] = useSetting("deviceIMEIList", {
		global: true,
	});

	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	const onDelete = () => {
		if (IMEI) {
			if (!inUse) {
				const updatedDevices = devices.filter(
					(item: deviceIMEIList) => item["IMEI"] !== IMEI,
				);
				deleteDevice(updatedDevices);
				show({
					message: "Device Deleted Successfully",
					type: { success: true },
				});
				onHide();
			} else {
				onHide();
				show({
					message: `Device with IMEI ${IMEI} can not be deleted since it has dependencies with a client`,
					type: { info: true },
				});
			}
		}
	};

	return (
		<div>
			<Modal
				position="middle"
				hide={hide}
				onClose={() => {
					onHide();
				}}
			>
				<ModalTitle>
					<h3
						className="m-0"
						style={{
							marginBottom: "16px",
							fontWeight: "500",
						}}
					>
						{i18n.t("Delete DAT Device")}
					</h3>
				</ModalTitle>
				<ModalContent>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							padding: "32px",
						}}
					>
						<label style={{ fontSize: "16px" }}>
							{i18n.t(
								"Are you sure you want to delete the device with IMEI ",
							)}
						</label>
						<span style={{ fontWeight: "bold" }}>
							{i18n.t(`${IMEI}`)}
						</span>
					</div>
				</ModalContent>
				<ModalActions>
					<ButtonStrip end>
						<Button
							onClick={() => {
								onHide();
							}}
							secondary
						>
							{i18n.t("Cancel")}
						</Button>
						<Button
							onClick={() => {
								onDelete();
							}}
							destructive
						>
							{i18n.t("Delete")}
						</Button>
					</ButtonStrip>
				</ModalActions>
			</Modal>
		</div>
	);
}

export default DeleteDevice;
