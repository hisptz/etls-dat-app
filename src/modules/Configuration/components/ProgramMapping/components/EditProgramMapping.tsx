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
import { edit } from "../state";
import { FilterField } from "./FilterField";
import { Option } from "../hooks/data";
import { generateUid, useProgramStage } from "../hooks/save";
import { useSetting } from "@dhis2/app-service-datastore";
import { useDataQuery } from "@dhis2/app-runtime";
import { isEmpty } from "lodash";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface EditProps {
	programOptions: Option[];
	attributeOptions: Option[];
	error: any;
	onUpdate: ReturnType<typeof useDataQuery>["refetch"];
}

const schema = z.object({
	program: z.string().nonempty("Mapped TB Program is required"),
	programStage: z.string().optional(),
	mediatorUrl: z.string().nonempty("Mediator Url is required"),
	apiKey: z.string().nonempty("API Key is required"),
	attributes: z.object({
		firstName: z.string().nonempty("First Name attribute is required"),
		surname: z.string().nonempty("Surname attribute is required"),
		tbDistrictNumber: z.string().nonempty("TB District Number is required"),
		age: z.string().nonempty("Age attribute is required"),
		sex: z.string().nonempty("Sex attribute is required"),
		regimen: z.string().nonempty("Regimen attribute is required"),
		phoneNumber: z.string().nonempty("Phone Number attribute is required"),
		deviceIMEInumber: z.string().nonempty("Device IMEI Number is required"),
	}),
});

type ProgramFormData = z.infer<typeof schema>;

function Edit({
	programOptions,
	attributeOptions,
	error,
	onUpdate,
}: EditProps) {
	const [hideEdit, setHide] = useRecoilState<boolean>(edit);
	const [importMeta, setImport] = useState<boolean>(false);
	const { importProgramStage } = useProgramStage();
	const [programMapping, { set: setProgramMapping }] = useSetting(
		"programMapping",
		{
			global: true,
		},
	);

	const onSubmit = async (data: ProgramFormData) => {
		const programStageID =
			data.program === programMapping.program
				? programMapping.programStage
				: generateUid();
		data.programStage = programStageID;
		await setProgramMapping(data);
		await onUpdate({
			programID: data.program,
		});
		setHide(true);
		setImport(!importMeta);
		console.log(data);
	};

	const onClose = () => {
		setHide(true);
		form.reset({});
	};

	useEffect(() => {
		if (!isEmpty(programMapping.program)) {
			importProgramStage();
		}
	}, [importMeta]);

	if (error) {
		throw error;
	}

	const form = useForm<ProgramFormData>({
		defaultValues: async () => {
			return new Promise((resolve) => resolve(programMapping));
		},
		resolver: zodResolver(schema),
	});

	return (
		<div>
			<Modal position="middle" hide={hideEdit} onClose={onClose}>
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
									options={programOptions}
									name="program"
									label={i18n.t("Mapped TB Program")}
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
									name="attributes.tbDistrictNumber"
									label={i18n.t("TB District Number")}
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
									type="text"
								/>
							</div>
						</FormProvider>
					</div>
				</ModalContent>
				<ModalActions>
					<ButtonStrip end>
						<Button onClick={onClose} secondary>
							{i18n.t("Hide")}
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
