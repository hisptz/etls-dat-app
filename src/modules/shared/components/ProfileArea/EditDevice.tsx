import React from "react";
import {
	Button,
	Modal,
	ModalTitle,
	ModalContent,
	ModalActions,
	ButtonStrip,
	SingleSelectField,
	SingleSelectOption,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { useRecoilState } from "recoil";
import { AddDevice } from "../../state";
import { FilterField } from "../../../Configuration/components/ProgramMapping/components/FilterField";

interface editDeviceProps {
	name: string;
	value: string;
	options: [{ name: string; code: string }];
}

function EditDevice({ name, options, value }: editDeviceProps) {
	const [hide, setHide] = useRecoilState<boolean>(AddDevice);

	const onChange = ({ value }: { value: string }) => {
		null;
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
							type="select"
							options={options}
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
