/* eslint-disable indent */
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
import { FilterField } from "./FilterField";
import { Option } from "../hooks/data";
import { generateUid, useProgramStage } from "../hooks/save";
import { useSetting } from "@dhis2/app-service-datastore";
import { useAlert, useDataQuery } from "@dhis2/app-runtime";
import { isEmpty } from "lodash";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProgramMapping } from "../../../../shared/constants";

interface EditProps {
	programOptions: Option[];
	attributeOptions: Option[];
	error: any;
	onUpdate?: ReturnType<typeof useDataQuery>["refetch"];
	hide: boolean;
	onHide: () => void;
	data?: ProgramMapping;
}

const schema = z.object({
	name: z
		.string({ required_error: "Name is required" })
		.nonempty("Name is required"),
	program: z
		.string({ required_error: "Mapped Program is required" })
		.nonempty("Mapped Program is required"),
	programStage: z.string().optional(),
	mediatorUrl: z
		.string({ required_error: "Mediator Url is required" })
		.nonempty("Mediator Url is required"),
	apiKey: z
		.string({ required_error: "API Key is required" })
		.nonempty("API Key is required"),
	attributes: z.object({
		firstName: z
			.string({ required_error: "First Name attribute is required" })
			.nonempty("First Name attribute is required"),
		surname: z
			.string({ required_error: "Surname attribute is required" })
			.nonempty("Surname attribute is required"),
		patientNumber: z
			.string({ required_error: "Patient Number is required" })
			.nonempty("Patient Number is required"),
		age: z
			.string({ required_error: "Age attribute is required" })
			.nonempty("Age attribute is required"),
		sex: z
			.string({ required_error: "Sex attribute is required" })
			.nonempty("Sex attribute is required"),
		regimen: z
			.string({ required_error: "Regimen attribute is required" })
			.nonempty("Regimen attribute is required"),
		phoneNumber: z
			.string({ required_error: "Phone Number attribute is required" })
			.nonempty("Phone Number attribute is required"),
		deviceIMEInumber: z
			.string({ required_error: "Device IMEI Number is required" })
			.nonempty("Device IMEI Number is required"),
	}),
});

export type ProgramFormData = z.infer<typeof schema>;

function Edit({
	programOptions,
	attributeOptions,
	error,
	hide,
	onHide,
	onUpdate,

	data,
}: EditProps) {
	const { importProgramStage } = useProgramStage();

	const [programMapping, { set: setProgramMapping }] = useSetting(
		"programMapping",
		{
			global: true,
		},
	);

	const addNew = !data;

	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	const updateProgramMappingAndShowSuccess = async (updatedMapping: any) => {
		await setProgramMapping(updatedMapping);
	};

	const onSave = async (mappingData: ProgramFormData) => {
		if (mappingData) {
			const updatedMapping = [...programMapping, mappingData];
			await updateProgramMappingAndShowSuccess(updatedMapping);
		}
	};

	const onEdit = async (mappingData: ProgramFormData) => {
		if (mappingData) {
			const updatedMapping = programMapping.map(
				(mapping: ProgramMapping) =>
					mapping.program === mappingData.program
						? {
								...mapping,
								name: mappingData.name,
								program: mappingData.program,
								programStage: mappingData.programStage,
								mediatorUrl: mappingData.mediatorUrl,
								apiKey: mappingData.apiKey,
								attributes: {
									firstName: mappingData.attributes.firstName,
									surname: mappingData.attributes.surname,
									patientNumber:
										mappingData.attributes.patientNumber,
									age: mappingData.attributes.age,
									sex: mappingData.attributes.sex,
									regimen: mappingData.attributes.regimen,
									phoneNumber:
										mappingData.attributes.phoneNumber,
									deviceIMEInumber:
										mappingData.attributes.deviceIMEInumber,
								},
						  }
						: mapping,
			);
			await updateProgramMappingAndShowSuccess(updatedMapping);
		}
	};

	const onSubmit = async (data: ProgramFormData) => {
		let foundMapping = false;

		programMapping.forEach((mapping: ProgramFormData) => {
			if (mapping.program === data.program) {
				data.programStage = mapping.programStage;
				foundMapping = true;
			}
		});

		if (!foundMapping) {
			data.programStage = generateUid();
		}

		addNew ? await onSave(data) : await onEdit(data);

		if (!isEmpty(programMapping)) {
			addNew
				? await importProgramStage(data)
				: await Promise.all(
						programMapping.map(async (mapping: ProgramFormData) =>
							mapping.program === data.program
								? importProgramStage(mapping)
								: null,
						),
				  );
		}
		onUpdate ? await onUpdate() : null;

		show({
			message: "Program Mapping Updated Successfully",
			type: { success: true },
		});

		onClose();
	};

	const onClose = () => {
		onHide();
		form.reset({});
	};

	if (error) {
		throw error;
	}

	const form = useForm<ProgramFormData>({
		defaultValues: { ...data },
		resolver: zodResolver(schema),
	});

	return (
		<div>
			<Modal position="middle" hide={hide} onClose={onClose}>
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
						<FormProvider {...form}>
							<div style={{ padding: "5px" }}>
								<FilterField
									required={true}
									name="name"
									label={i18n.t("Name")}
									type="text"
								/>
							</div>
							<div style={{ padding: "5px" }}>
								<FilterField
									required={true}
									disabled={addNew ? false : true}
									options={programOptions}
									name="program"
									label={i18n.t("Mapped Program")}
									type="select"
								/>
							</div>
							<div style={{ padding: "5px" }}>
								<FilterField
									options={attributeOptions}
									required={true}
									name="attributes.firstName"
									label={i18n.t("First Name")}
									type="select"
								/>
							</div>
							<div style={{ padding: "5px" }}>
								<FilterField
									options={attributeOptions}
									required={true}
									name="attributes.surname"
									label={i18n.t("Surname")}
									type="select"
								/>
							</div>
							<div style={{ padding: "5px" }}>
								<FilterField
									options={attributeOptions}
									required={true}
									name="attributes.patientNumber"
									label={i18n.t("Patient Number")}
									type="select"
								/>
							</div>
							<div style={{ padding: "5px" }}>
								<FilterField
									options={attributeOptions}
									required={true}
									name="attributes.age"
									label={i18n.t("Age")}
									type="select"
								/>
							</div>
							<div style={{ padding: "5px" }}>
								<FilterField
									options={attributeOptions}
									required={true}
									name="attributes.sex"
									label={i18n.t("Sex")}
									type="select"
								/>
							</div>
							<div style={{ padding: "5px" }}>
								<FilterField
									options={attributeOptions}
									required={true}
									name="attributes.regimen"
									label={i18n.t("Regimen")}
									type="select"
								/>
							</div>
							<div style={{ padding: "5px" }}>
								<FilterField
									options={attributeOptions}
									required={true}
									name="attributes.phoneNumber"
									label={i18n.t("Phone Number")}
									type="select"
								/>
							</div>
							<div style={{ padding: "5px" }}>
								<FilterField
									options={attributeOptions}
									required={true}
									name="attributes.deviceIMEInumber"
									label={i18n.t("Device IMEI Number")}
									type="select"
								/>
							</div>
							<div style={{ padding: "5px" }}>
								<FilterField
									required={true}
									name="mediatorUrl"
									label={i18n.t("Mediator Url")}
									type="text"
								/>
							</div>
							<div style={{ padding: "5px" }}>
								<FilterField
									required={true}
									name="apiKey"
									label={i18n.t("API Key")}
									type="password"
								/>
							</div>
						</FormProvider>
					</div>
				</ModalContent>
				<ModalActions>
					<ButtonStrip end>
						<Button onClick={onClose} secondary>
							{i18n.t("Cancel")}
						</Button>
						<Button
							loading={form.formState.isSubmitting}
							onClick={form.handleSubmit(onSubmit)}
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
