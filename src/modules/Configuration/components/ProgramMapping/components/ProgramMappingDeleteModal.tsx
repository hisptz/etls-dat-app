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

import { useAlert } from "@dhis2/app-runtime";
import { ProgramFormData } from "./ProgramMappingForm";

interface DeleteProgramMappingProps {
	mappedProgram?: string;
	onHide: () => void;
	hide: boolean;
}

function ProgramMappingDeleteModal({ mappedProgram, hide, onHide }: DeleteProgramMappingProps) {
	const [programMapping, { set: deleteProgramMapping }] = useSetting(
		"programMapping",
		{
			global: true,
		},
	);
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	const onDelete = () => {
		if (mappedProgram) {
			const updatedRegimens = programMapping.filter(
				(item: ProgramFormData) => item["name"] !== mappedProgram,
			);
			deleteProgramMapping(updatedRegimens);
			show({
				message: "Program Mapping Deleted Successfully",
				type: { success: true },
			});
			onHide();
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
						{i18n.t("Delete Program Mapping")}
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
								"Are you sure you want to delete this program mapping",
							)}
						</label>
						<span style={{ fontWeight: "bold" }}>
							{i18n.t(`${mappedProgram}`)}
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

export default ProgramMappingDeleteModal;
