import React, { useEffect, useState } from "react";
import {
	InputField,
	MultiSelectField,
	MultiSelectOption,
	SingleSelectField,
	SingleSelectOption,
	IconLaunch16,
	IconTable24,
	MenuItem,
	Modal,
	ModalTitle,
	ModalContent,
	ButtonStrip,
	Button,
	ModalActions,
} from "@dhis2/ui";
import { useSearchParams } from "react-router-dom";
import { compact, isEmpty } from "lodash";
import {
	DATA_TEST_PREFIX,
	ReportConfig,
} from "../../../../../shared/constants";
import { Option } from "../../../../../shared/types";
import i18n from "@dhis2/d2-i18n";
import { OrgUnitSelectorModal } from "@hisptz/dhis2-ui";
import { PeriodSelectorModal } from "@hisptz/dhis2-ui";
import { useSetting } from "@dhis2/app-service-datastore";
import { useOrgUnit } from "../../../../utils/orgUnits";

export interface FilterFieldProps {
	name: string;
	label: string;
	options?: Option[];
	type:
		| "date"
		| "text"
		| "select"
		| "report"
		| "periods"
		| "organisation units";
	multiSelect?: boolean;
}

export function FilterField({
	name,
	label,
	options,
	type,
	multiSelect,
}: FilterFieldProps) {
	const [params, setParams] = useSearchParams();
	const value = params.get(name);
	const [orgUnits, setOrgUnits] = useState<boolean>(true);
	const [periods, setPeriods] = useState<boolean>(true);
	const [reports, setReports] = useState<boolean>(true);
	const [selectedOrgUnits, setSelectedOrgUnits] = useState<[]>();
	const [reportConfig] = useSetting("reports", { global: true });
	const { orgUnit, loading } = useOrgUnit();

	const transformAndJoinArray = (inputArray: string[]) => {
		for (let i = 0; i < inputArray.length; i++) {
			const item = inputArray[i].replace(/_/g, " ").toLowerCase();
			const words = item.split(" ");
			for (let j = 0; j < words.length; j++) {
				words[j] = words[j].charAt(0).toUpperCase() + words[j].slice(1);
			}
			inputArray[i] = words.join(" ");
		}
		return inputArray.join(", ");
	};

	const onChange = ({ value }: { value: any }) => {
		setParams((params) => {
			const updatedParams = new URLSearchParams(params);
			updatedParams.set(
				name,
				type == "organisation units"
					? value
							.map((ou: any) => {
								return ou.id;
							})
							.join(";")
					: value,
			);

			return updatedParams;
		});
	};

	const showSelection = () => {
		if (type === "organisation units") {
			setOrgUnits(false);
		}
		if (type === "periods") {
			setPeriods(false);
		}
		if (type === "report") {
			setReports(false);
		}
	};

	const showSelected = () => {
		if (type === "organisation units") {
			return loading
				? i18n.t("Loading...")
				: (selectedOrgUnits ?? orgUnit)?.map((orgUnit: any) => {
						return value?.split(";").map((ou: string) => {
							if (orgUnit.id == ou) {
								return orgUnit.displayName;
							}
						});
				  });
		}
		if (type === "periods") {
			const periods = transformAndJoinArray(value?.split(",") ?? []);
			return periods;
		}
		if (type === "report") {
			return reportConfig?.map((report: ReportConfig) => {
				if (report.id === value) {
					return report.name;
				}
			});
		}
	};

	if (type === "select") {
		if (multiSelect) {
			return (
				<MultiSelectField
					dataTest={`${DATA_TEST_PREFIX}-${name}`}
					id={name}
					clearable
					selected={isEmpty(value) ? [] : value?.split(",")}
					filterable={(options?.length ?? 0) > 5}
					onChange={({ selected }: { selected: string[] }) =>
						onChange({ value: selected.join(",") })
					}
					value={value}
					name={name}
					label={label}
				>
					{options?.map(({ name, code }) => (
						<MultiSelectOption
							key={`${code}-option`}
							label={name}
							value={code}
						/>
					))}
				</MultiSelectField>
			);
		}
		return (
			<SingleSelectField
				dataTest={`${DATA_TEST_PREFIX}-${name}`}
				id={name}
				clearable
				selected={value}
				filterable={(options?.length ?? 0) > 5}
				onChange={({ selected }: { selected: string }) =>
					onChange({ value: selected })
				}
				value={value}
				name={name}
				label={label}
			>
				{options?.map(({ name, code }) => (
					<SingleSelectOption
						key={`${code}-option`}
						label={name}
						value={code}
					/>
				))}
			</SingleSelectField>
		);
	}

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "start",
				alignItems: "center",
				marginRight: "15px",
			}}
		>
			<div
				style={{
					marginRight: "5px",
					color: "#888989",
					fontSize: "15px",
				}}
			>
				{i18n.t(label)}
			</div>
			<div
				style={{
					fontWeight: "400",
					cursor: "pointer",
					fontSize: "16px",
					marginRight: "10px",
					alignItems: "center",
					display: "flex",
					justifyContent: "start",
				}}
				onClick={() => {
					showSelection();
				}}
			>
				<span style={{ marginRight: "5px" }}>
					{value ? showSelected() : i18n.t(`Choose ${type}`)}
				</span>
				<IconLaunch16 color="#888989" />
			</div>
			{loading ? null : (
				<OrgUnitSelectorModal
					value={{
						orgUnits: orgUnit,
					}}
					hide={orgUnits}
					onClose={() => {
						setOrgUnits(!orgUnits);
					}}
					onUpdate={async (val: any) => {
						setOrgUnits(!orgUnits);

						onChange({ value: val.orgUnits });
						setSelectedOrgUnits(val.orgUnits);
					}}
				/>
			)}
			<PeriodSelectorModal
				enablePeriodSelector
				hide={periods}
				selectedPeriods={type == "periods" ? value?.split(",") : []}
				onClose={() => {
					setPeriods(!periods);
				}}
				onUpdate={async (val: any) => {
					setPeriods(!periods);
					onChange({ value: val });
				}}
			/>
			<Modal
				hide={reports}
				onClose={() => {
					setReports(!reports);
				}}
			>
				<ModalTitle> {i18n.t("Report Types")}</ModalTitle>
				<ModalContent>
					{reportConfig?.map((report: ReportConfig, i: number) => {
						return (
							<div
								key={i}
								style={{
									padding: "10px",
								}}
							>
								<MenuItem
									key={i}
									icon={<IconTable24 />}
									onClick={async () => {
										onChange({ value: report.id });
										setReports(!reports);
									}}
									label={report.name}
								/>
							</div>
						);
					})}
				</ModalContent>
			</Modal>
		</div>
	);
}
