import React from "react";
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
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { useRecoilState } from "recoil";
import { FilterField } from "../../ProgramMapping/components/FilterField";
import { edit } from "../state";
import { deviceConfig } from "../models/device";

function EditDevice({ emei, addNew }: deviceConfig) {
	const [hide, setHide] = useRecoilState<boolean>(edit);

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
						style={{ marginBottom: "10px", fontWeight: "500" }}
					>
						{i18n.t("DAT Device Form")}
					</h3>
				</ModalTitle>
				<ModalContent>
					<div
						style={{
							height: "300px",
						}}
					>
						{addNew == true ? (
							<div>
								<SwitchField
									label={i18n.t("Bulk Upload")}
									name="bulkUpload"
									onChange={() => {
										null;
									}}
									value={true}
								/>
								<br />

								<FileInputField
									helpText={i18n.t(
										"Add an excel file with a list of devices only",
									)}
									label={i18n.t("Device File")}
									name="uploadName"
									onChange={{}}
								>
									<FileListItem
										label="IMEI.xlsx"
										onRemove={{}}
										removeText="remove"
									/>
								</FileInputField>
								<br />
							</div>
						) : null}
						<FilterField
							label={i18n.t("Device IMEI number")}
							name={emei!}
							type="text"
						/>

						<label style={{ fontSize: "12px" }}>
							{i18n.t(
								"Add the EMEI number as seen on the device",
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
							onClick={() => {
								null;
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
