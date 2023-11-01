import React, { useEffect, useState } from "react";
import {
	Button,
	Modal,
	ModalTitle,
	ModalContent,
	ModalActions,
	ButtonStrip,
	AlertBar,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { remove } from "../state";
import { useRecoilState } from "recoil";
import { useSetting } from "@dhis2/app-service-datastore";
import { RegimenFormData } from "./EditRegimen";

interface DeleteSetting {
	regimen?: string;
}

function DeleteSetting({ regimen }: DeleteSetting) {
	const [hideModal, setHide] = useRecoilState<boolean>(remove);
	const [regimens, { set: deleteSetting }] = useSetting("regimenSetting", {
		global: true,
	});
	const [showSuccess, setShowSuccess] = useState<boolean>(false);

	const onDelete = () => {
		if (regimen) {
			const updatedRegimens = regimens.filter(
				(item: RegimenFormData) => item["regimen"] !== regimen,
			);
			deleteSetting(updatedRegimens);
			setShowSuccess(true);
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
						{i18n.t("Delete Regimen Setting")}
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
								"Are you sure you want to delete this regimen setting ",
							)}
						</label>
						<span style={{ fontWeight: "bold" }}>
							{i18n.t(`${regimen}`)}
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
						{i18n.t("Regimen deleted successfully")}
					</AlertBar>
				</div>
			)}
		</div>
	);
}

export default DeleteSetting;
