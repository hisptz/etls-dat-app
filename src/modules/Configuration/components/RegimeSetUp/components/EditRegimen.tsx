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
import { useRecoilState } from "recoil";
import { FilterField } from "../../ProgramMapping/components/FilterField";
import { add, editRegimen } from "../state";
import { useSearchParams } from "react-router-dom";
import { getDefaultFilters } from "../../constants/filters";
import { useSetting } from "@dhis2/app-service-datastore";
import { regimenSetting } from "../../../../shared/constants";
import { Option, useRegimens } from "../hooks/data";
import { getEditFilters } from "../hooks/save";
import { isEmpty } from "lodash";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
	regimen: z.string().nonempty("Regmien is required"),
	administration: z.string().nonempty("Administration is required"),
	idealDoses: z.string().nonempty("Ideal Doses is required"),
	idealDuration: z.string().nonempty("Ideal Duration is required"),
	completionMinimumDoses: z
		.string()
		.nonempty("Completion Minimum Doses is required"),
	completionMaximumDuration: z
		.string()
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
	const [showSuccess, setShowSuccess] = useState<boolean>(false);
	const { regimenOptions, administrationOptions, loading, refetch } =
		useRegimens();
	const [availableRegimen, setAvailableRegimen] = useState<Option[]>();

	const regimenOptionsArray = regimenOptions?.map((option) => option.code);

	const filteredRegimenOptions = regimenOptionsArray?.filter((regimen) => {
		return !settings.some(
			(item: regimenSetting) => item.regimen === regimen,
		);
	});

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

	const onResetClick = () => {
		form.reset({});
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
		setShowSuccess(true);
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

	useEffect(() => {
		if (data) {
			form.reset(data);
		}
	}, [data, index]);

	const form = useForm<RegimenFormData>({
		resolver: zodResolver(schema),
	});

	return loading ? (
		<></>
	) : (
		<div>
			<Modal
				position="middle"
				hide={hide}
				onClose={() => {
					setHide(true);
					setAdd(false);
					onResetClick();
				}}
			>
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
						<Button
							onClick={() => {
								setHide(true);
								setAdd(false);
								onResetClick();
							}}
							secondary
						>
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
						{i18n.t("Setting updated successfully")}
					</AlertBar>
				</div>
			)}
		</div>
	);
};

export default AddSetting;
