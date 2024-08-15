import React from "react";
import i18n from "@dhis2/d2-i18n";
import {
	Button,
	Modal,
	ModalTitle,
	ModalContent,
	ModalActions,
	ButtonStrip,
} from "@dhis2/ui";
import { useAssignDevice } from "../../utils/assignDevice";
import { useAlert } from "@dhis2/app-runtime";

interface RemoveDeviceModalProps {
	imei: string;
	patientName: string;
	hide: boolean;
	onConfirm: () => void;
	onClose: () => void;
	refetch: () => void;
}

export default function RemoveDeviceModal({
	imei,
	patientName,
	onConfirm,
	hide,
	refetch,
	onClose,
}: RemoveDeviceModalProps) {
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);
	const { unassignDevice, unassignDeviceWisePill } = useAssignDevice();

	const onSave = async () => {
		try {
			await unassignDeviceWisePill({ imei }).then(
				async (wisepillResponse) => {
					if (
						wisepillResponse.response &&
						wisepillResponse.response.status === 200
					) {
						await unassignDevice().then(async (res) => {
							if (res?.updated != 0) {
								show({
									message: "Device removed successful",
									type: { success: true },
								});
								refetch();
							} else if (res.ignored != 0) {
								show({
									message: `Could not remove device: ${res.error[0]?.value}`,
									type: { critical: true },
								});
							}
						});
					}
				},
			);

			onConfirm();
			show({
				message: i18n.t("Device removed successfully"),
				type: { success: true },
			});
		} catch (error) {
			show({
				message: i18n.t("Failed to remove device"),
				type: { warning: true },
			});
		}
	};

	return (
		<Modal small position="middle" hide={hide} onClose={onClose}>
			<ModalTitle>{i18n.t("Remove Device")}</ModalTitle>
			<ModalContent>
				{i18n.t(
					`Are you sure you want to remove the device with IMEI ${imei} from patient ${patientName}?`,
				)}
			</ModalContent>
			<ModalActions>
				<ButtonStrip>
					<Button onClick={onClose}>{i18n.t("Cancel")}</Button>
					<Button destructive onClick={onConfirm}>
						{i18n.t("Remove")}
					</Button>
				</ButtonStrip>
			</ModalActions>
		</Modal>
	);
}
