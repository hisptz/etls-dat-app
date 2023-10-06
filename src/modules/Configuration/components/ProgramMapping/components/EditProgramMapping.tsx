import React from "react";
import {
	Button,
	Modal,
	ModalTitle,
	ModalContent,
	ModalActions,
	ButtonStrip,
	CircularLoader,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { useRecoilState } from "recoil";
import { edit } from "../state";
import { FilterField } from "./FilterField";
import { Option } from "../hooks/data";
import { useProgramMapping } from "../hooks/save";
import { useSetting } from "@dhis2/app-service-datastore";

interface EditProps {
	programOptions: Option[];
	attributeOptions: Option[];
	error: any;
}

function Edit({ programOptions, attributeOptions, error }: EditProps) {
	const [hideEdit, setHide] = useRecoilState<boolean>(edit);
	const { programMapping } = useProgramMapping();
	const [pM, { set: setPM }] = useSetting("programMapping", { global: true });

	const onSave = () => {
		if (programMapping) {
			setPM(programMapping);
			setHide(true);
		}
	};

	if (error) {
		throw error;
	}

	return (
		<div>
			<Modal
				position="middle"
				hide={hideEdit}
				onClose={() => {
					setHide(true);
				}}
			>
				<ModalTitle>
					<h3
						className="m-0"
						style={{ marginBottom: "16px", fontWeight: "600" }}
					>
						{i18n.t("Program Mapping")}
					</h3>
				</ModalTitle>
				<ModalContent>
					<div style={{ height: "400px" }}>
						<div style={{ padding: "5px" }}>
							<FilterField
								required={true}
								options={programOptions}
								name="mapped-tb-program"
								label={i18n.t("Mapped TB Program")}
								type="select"
							/>
						</div>
						<div style={{ padding: "5px" }}>
							<FilterField
								options={attributeOptions}
								required={true}
								name="firstName"
								label={i18n.t("First Name")}
								type="select"
							/>
						</div>
						<div style={{ padding: "5px" }}>
							<FilterField
								options={attributeOptions}
								required={true}
								name="surname"
								label={i18n.t("Surname")}
								type="select"
							/>
						</div>
						<div style={{ padding: "5px" }}>
							<FilterField
								options={attributeOptions}
								required={true}
								name="tb-identification-number"
								label={i18n.t("TB Identification Number")}
								type="select"
							/>
						</div>
						<div style={{ padding: "5px" }}>
							<FilterField
								options={attributeOptions}
								required={true}
								name="dateOfBirth"
								label={i18n.t("Date of Birth")}
								type="select"
							/>
						</div>
						<div style={{ padding: "5px" }}>
							<FilterField
								options={attributeOptions}
								required={true}
								name="sex"
								label={i18n.t("Sex")}
								type="select"
							/>
						</div>
						<div style={{ padding: "5px" }}>
							<FilterField
								options={attributeOptions}
								required={true}
								name="adherenceFrequency"
								label={i18n.t("Adherence Frequency")}
								type="select"
							/>
						</div>
						<div style={{ padding: "5px" }}>
							<FilterField
								options={attributeOptions}
								required={true}
								name="phoneNumber"
								label={i18n.t("Phone Number")}
								type="select"
							/>
						</div>
						<div style={{ padding: "5px" }}>
							<FilterField
								options={attributeOptions}
								required={true}
								name="deviceIMEInumber"
								label={i18n.t("Device IMEI Number")}
								type="select"
							/>
						</div>
						<div style={{ padding: "5px" }}>
							<FilterField
								required={true}
								name="mediatorurl"
								label={i18n.t("Mediator Url")}
								type="text"
							/>
						</div>
						<div style={{ padding: "5px" }}>
							<FilterField
								required={true}
								name="apiKey"
								label={i18n.t("API Key")}
								type="text"
							/>
						</div>
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
								onSave();
								console.log(pM);
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

export default Edit;
