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
import { FilterField } from "../../ProgramMapping/components/FilterField";
import { add, editRegimen } from "../state";
import { useSetting } from "@dhis2/app-service-datastore";
import { regimenSetting } from "../../../../shared/constants";
import { Option, useRegimens } from "../hooks/data";
import { isEmpty } from "lodash";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAlert } from "@dhis2/app-runtime";

const schema = z.object({
	regimen: z
		.string({ required_error: "Regimen is required" })
		.nonempty("Regmien is required"),
	administration: z
		.string({ required_error: "Administration is required" })
		.nonempty("Administration is required"),
	idealDoses: z
		.string({ required_error: "Ideal Doses is required" })
		.nonempty("Ideal Doses is required"),
	idealDuration: z
		.string({ required_error: "Ideal Duration is required" })
		.nonempty("Ideal Duration is required"),
	completionMinimumDoses: z
		.string({ required_error: "Completion Minimum is required" })
		.nonempty("Completion Minimum Doses is required"),
	completionMaximumDuration: z
		.string({ required_error: "Completion Maximum is required" })
		.nonempty("Completion Maximum Duration is required"),
});

export type RegimenFormData = z.infer<typeof schema>;

const AddSetting = ({
	data,
	index,
}: {
	data?: RegimenFormData;
	index?: number;
}) => {
	const [hide, setHide] = useRecoilState<boolean>(editRegimen);
	const [addNew, setAdd] = useRecoilState<boolean>(add);

	const [settings, { set: addRegimen }] = useSetting("regimenSetting", {
		global: true,
	});
	const [programMapping] = useSetting("programMapping", {
		global: true,
	});

	const { regimenOptions, administrationOptions, loading, refetch } =
		useRegimens();
	const [availableRegimen, setAvailableRegimen] = useState<Option[]>();

	const regimenOptionsArray = regimenOptions?.map((option) => option.code);

	const filteredRegimenOptions = regimenOptionsArray?.filter((regimen) => {
		return !settings.some(
			(item: regimenSetting) => item.regimen === regimen,
		);
	});
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	useEffect(() => {
		if (!isEmpty(programMapping.attributes.regimen)) {
			refetch();
		}
	}, []);

	useEffect(() => {
		if (!hide && !addNew) {
			null;
		} else {
			onResetClick();
		}

		const transformedSettings: Option[] =
			filteredRegimenOptions?.map((item: string) => {
				return {
					id: item,
					name: item,
					displayName: item,
					code: item,
				};
			}) ?? [];

		setAvailableRegimen(transformedSettings);
	}, [hide, index]);

	const onResetClick = async () => {
		form.reset({});
	};

	const onClose = async () => {
		form.reset({});
		setHide(true);
		setAdd(false);
	};

	const currentRegimen: Option[] = [
		{
			name: data?.regimen ?? "",
			code: data?.regimen ?? "",
			displayName: data?.regimen ?? "",
			id: data?.regimen ?? "",
		},
	];

	const updateRegimeSettingsAndShowSuccess = (updatedRegimen: any) => {
		addRegimen(updatedRegimen);
		setHide(true);
		setAdd(false);
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
			const updatedSetting = settings.map((setting: regimenSetting) =>
				setting.regimen === regimenData.regimen
					? {
							...setting,
							regimen: regimenData.regimen,
							administration: regimenData.administration,
							idealDoses: regimenData.idealDoses,
							idealDuration: regimenData.idealDuration,
							completionMinimumDoses:
								regimenData.completionMinimumDoses,
							completionMaximumDuration:
								regimenData.completionMaximumDuration,
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
		defaultValues: async () => {
			return new Promise((resolve) =>
				resolve(
					addNew
						? {}
						: {
								regimen: currentRegimen[0].name,
								idealDuration: data?.idealDuration,
								idealDoses: data?.idealDoses,
								completionMinimumDoses:
									data?.completionMinimumDoses,
								completionMaximumDuration:
									data?.completionMaximumDuration,
								administration: data?.administration,
						  },
				),
			);
		},
		resolver: zodResolver(schema),
	});

	return loading ? (
		<></>
	) : (
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
								<FilterField
									options={
										addNew
											? availableRegimen
											: currentRegimen
									}
									label={i18n.t("Regimen")}
									name="regimen"
									type="select"
									required
								/>
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
									label={i18n.t("Ideal Doses")}
									name="idealDoses"
									type="text"
									required
								/>
							</div>
							<div style={{ padding: "5px" }}>
								<FilterField
									label={i18n.t("Ideal Duration (Months)")}
									name="idealDuration"
									type="text"
									required
								/>
							</div>
							<div style={{ padding: "5px" }}>
								<FilterField
									label={i18n.t("Completion Minimum Doses")}
									name="completionMinimumDoses"
									type="text"
									required
								/>
							</div>
							<div style={{ padding: "5px" }}>
								<FilterField
									label={i18n.t(
										"Completion Maximum Duration (Months)",
									)}
									name="completionMaximumDuration"
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
};

export default AddSetting;
