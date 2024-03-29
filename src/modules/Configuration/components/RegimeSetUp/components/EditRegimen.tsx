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
import { FilterField } from "../../ProgramMapping/components/FilterField";
import { useSetting } from "@dhis2/app-service-datastore";
import { RegimenSetting } from "../../../../shared/constants";
import { Option } from "../hooks/data";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAlert } from "@dhis2/app-runtime";
import RegimenOption from "./RegimenOption";

const schema = z.object({
	regimen: z
		.string({ required_error: "Regimen is required" })
		.nonempty("Regmien is required"),
	administration: z
		.string({ required_error: "Administration is required" })
		.nonempty("Administration is required"),
	numberOfDoses: z
		.string({ required_error: "Number of Doses is required" })
		.nonempty("Number of Doses is required"),
});

export type RegimenFormData = z.infer<typeof schema>;

const AddSetting = ({
	data,
	onHide,
	hide,
}: {
	data?: RegimenFormData;
	onHide: () => void;
	hide: boolean;
}) => {
	const addNew = !data;
	const administrationOptions: Option[] = [
		{ name: "Daily", code: "Daily", id: "Daily", displayName: "Daily" },
		{ name: "Weekly", code: "Weekly", id: "Weekly", displayName: "Weekly" },
		{
			name: "Monthly",
			code: "Monthly",
			id: "Monthly",
			displayName: "Monthly",
		},
	];

	const [settings, { set: addRegimen }] = useSetting("regimenSetting", {
		global: true,
	});

	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	const onResetClick = async () => {
		form.reset({});
		onHide();
	};

	const onClose = async () => {
		form.reset({});
		onHide();
	};

	const updateRegimeSettingsAndShowSuccess = (updatedRegimen: any) => {
		addRegimen(updatedRegimen);

		show({
			message: "Setting Updated Successfully",
			type: { success: true },
		});
	};

	const onSave = async (regimenData: RegimenFormData) => {
		if (regimenData) {
			const updatedSetting = [...settings, regimenData];
			updateRegimeSettingsAndShowSuccess(updatedSetting);
			onResetClick();
		}
	};

	const onEdit = async (regimenData: RegimenFormData) => {
		if (regimenData) {
			const updatedSetting = settings.map((setting: RegimenSetting) =>
				setting.regimen === regimenData.regimen
					? {
							...setting,
							regimen: regimenData.regimen,
							administration: regimenData.administration,
							numberOfDoses: regimenData.numberOfDoses,
					  }
					: setting,
			);
			updateRegimeSettingsAndShowSuccess(updatedSetting);
			onResetClick();
		}
	};

	const onSubmit = async (data: RegimenFormData) => {
		addNew ? await onSave(data) : await onEdit(data);
	};

	const form = useForm<RegimenFormData>({
		defaultValues: data,
		resolver: zodResolver(schema),
	});

	return (
		<div>
			<Modal position="middle" hide={hide} onClose={onClose}>
				<ModalTitle>
					<h3
						className="m-0"
						style={{ marginBottom: "10px", fontWeight: "500" }}
					>
						{i18n.t("Regimen Setting Form")}
					</h3>
				</ModalTitle>
				<ModalContent>
					<div>
						<FormProvider {...form}>
							<div style={{ padding: "5px" }}>
								<RegimenOption addNew={addNew} data={data} />
							</div>
							<div style={{ padding: "5px" }}>
								<FilterField
									options={administrationOptions}
									label={i18n.t("Administration")}
									name="administration"
									type="select"
									required
								/>
							</div>
							<div style={{ padding: "5px" }}>
								<FilterField
									label={i18n.t("Number Of Doses")}
									name="numberOfDoses"
									type="text"
									required
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
};

export default AddSetting;
