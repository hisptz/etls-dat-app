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
import { add, edit } from "../state";
import { useSearchParams } from "react-router-dom";
import { getDefaultFilters } from "../../constants/filters";
import { useSetting } from "@dhis2/app-service-datastore";
import { regimenSetting } from "../../../../shared/constants";
import { Option, useRegimens } from "../hooks/data";
import { getEditFilters } from "../hooks/save";

const AddSetting = ({
	regimen,
	index,
}: {
	regimen?: regimenSetting;
	index?: number;
}) => {
	const [hide, setHide] = useRecoilState<boolean>(edit);
	const [addNew, setAdd] = useRecoilState<boolean>(add);

	const [disabled, setDisabled] = useState<boolean>(true);

	const [params, setParams] = useSearchParams();
	const [settings, { set: addRegimen }] = useSetting("regimenSetting", {
		global: true,
	});
	const regimens = params.get("regimen");
	const administration = params.get("administration");
	const idealDoses = params.get("idealDoses");
	const idealDuration = params.get("idealDuration");
	const completionMinimumDoses = params.get("completionMinimumDoses");
	const completionMaximumDuration = params.get("completionMaximumDuration");
	const [showSuccess, setShowSuccess] = useState<boolean>(false);
	const { regimenOptions, administrationOptions, loading } = useRegimens();
	const [availableRegimen, setAvailableRegimen] = useState<Option[]>();

	const defaultValue = getEditFilters(index);
	useEffect(() => {
		if (!hide && !addNew) {
			setParams(defaultValue);
		} else {
			onResetClick();
		}

		const regimenOptionsArray = regimenOptions?.map(
			(option) => option.code,
		);

		const filtered = settings.filter((item: regimenSetting) => {
			return !regimenOptionsArray?.includes(item.regimen);
		});
		console.log(filtered);

		const transformedSettings: Option[] = filtered.map(
			(item: regimenSetting) => {
				return {
					id: item.regimen,
					name: item.regimen,
					displayName: item.regimen,
					code: item.regimen,
				};
			},
		);

		setAvailableRegimen(transformedSettings);
	}, [hide, index]);

	useEffect(() => {
		setDisabled(
			!(
				regimens &&
				administration &&
				idealDoses &&
				idealDuration &&
				completionMinimumDoses &&
				completionMaximumDuration
			),
		);
	}, [
		regimens,
		administration,
		idealDoses,
		idealDuration,
		completionMaximumDuration,
		completionMinimumDoses,
	]);

	const onResetClick = () => {
		const defaultValue = getDefaultFilters();
		setParams(defaultValue);
	};

	const createRegimenSetting = (regimens: regimenSetting) => ({
		regimen: regimens.regimen,
		administration: regimens.administration,
		idealDoses: regimens.idealDoses,
		idealDuration: regimens.idealDuration,
		completionMinimumDoses: regimens.completionMinimumDoses,
		completionMaximumDuration: regimens.completionMaximumDuration,
	});

	const updateRegimeSettingsAndShowSuccess = (updatedRegimen: any) => {
		addRegimen(updatedRegimen);
		setHide(true);
		setAdd(false);
		setShowSuccess(true);
	};

	const onSave = () => {
		if (
			regimens &&
			administration &&
			idealDoses &&
			idealDuration &&
			completionMinimumDoses &&
			completionMaximumDuration
		) {
			const setting: regimenSetting = {
				regimen: regimens,
				administration: administration,
				idealDoses: idealDoses,
				idealDuration: idealDuration,
				completionMinimumDoses: completionMinimumDoses,
				completionMaximumDuration: completionMaximumDuration,
			};
			const newSetting = createRegimenSetting(setting);
			const updatedSetting = [...settings, newSetting];
			updateRegimeSettingsAndShowSuccess(updatedSetting);
			onResetClick();
		}
	};

	const onEdit = () => {
		if (
			regimens &&
			administration &&
			idealDoses &&
			idealDuration &&
			completionMinimumDoses &&
			completionMaximumDuration
		) {
			const updatedSetting = settings.map((setting: regimenSetting) =>
				setting.regimen === regimen?.regimen
					? {
							...setting,
							regimen: regimens,
							administration: administration,
							idealDoses: idealDoses,
							idealDuration: idealDuration,
							completionMinimumDoses: completionMinimumDoses,
							completionMaximumDuration:
								completionMaximumDuration,
					  }
					: setting,
			);
			updateRegimeSettingsAndShowSuccess(updatedSetting);
			onResetClick();
		}
	};

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
						<div style={{ padding: "5px" }}>
							<FilterField
								options={regimenOptions}
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
							disabled={disabled}
							onClick={() => {
								addNew ? onSave() : onEdit();
							}}
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
