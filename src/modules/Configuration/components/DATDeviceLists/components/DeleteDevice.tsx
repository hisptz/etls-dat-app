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
import { remove } from "../state";
import { useRecoilState } from "recoil";
import { useSetting } from "@dhis2/app-service-datastore";
import { deviceEmeiList } from "../../../../shared/constants";

interface DeleteDevice {
	emei?: string;
}

function DeleteDevice({ emei }: DeleteDevice) {
	const [hideModal, setHide] = useRecoilState<boolean>(remove);
	const [devices, { set: deleteDevice }] = useSetting("deviceEmeiList", {
		global: true,
	});

	const onDelete = () => {
		if (emei) {
			const updatedDevices = devices.filter(
				(item: deviceEmeiList) => item["emei"] !== emei,
			);
			deleteDevice(updatedDevices);
			setHide(true);
		}
	};

	return (
		<div>
			<Modal
				position="middle"
				hide={hideModal}
				onClose={() => {
					setHide(true);
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
								"Are you sure you want to delete the device with EMEI ",
							)}
						</label>
						<span style={{ fontWeight: "bold" }}>
							{i18n.t(`${emei}`)}
						</span>
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
