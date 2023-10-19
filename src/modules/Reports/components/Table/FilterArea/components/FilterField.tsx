import React, { useState } from "react";
import {
	InputField,
	MultiSelectField,
	MultiSelectOption,
	SingleSelectField,
	SingleSelectOption,
	IconLaunch24,
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

export interface ReportType {
	id?: string;
	name?: string;
	code?: string;
}

export interface FilterFieldProps {
	name: string;
	label: string;
	options?: Option[] | ReportType[];
	update?: (val: number) => void;
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
	update,
}: FilterFieldProps) {
	const [params, setParams] = useSearchParams();
	const value = params.get(name);
	const [orgUnits, setOrgUnits] = useState<boolean>(true);
	const [periods, setPeriods] = useState<boolean>(true);
	const [reports, setReports] = useState<boolean>(true);
	const [selectedReport, setSelectedReport] = useState<string>();
	const [selectedOrgUnits, setSelectedOrgUnits] = useState();
	const [selectedPeriods, setSelectedPeriods] = useState();
	const [reportConfig] = useSetting("reports", { global: true });
	const onChange = ({ value }: { value: any }) => {
		setParams((params) => {
			const updatedParams = new URLSearchParams(params);
			updatedParams.set(
				name,
				type == "organisation units"
					? value.map((ou: any) => {
							return ou.id;
					  })
					: value,
			);

			return updatedParams;
		});
		if (name == "reportType" && update != undefined) {
			options?.forEach((option, index) => {
				if (value == option.code) {
					update(index);
				}
			});
		}
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
			return "OU";
		}
		if (type === "periods") {
			return "Period";
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
				<IconLaunch24 color="#888989" />
			</div>
			<OrgUnitSelectorModal
				value={{}}
				hide={orgUnits}
				onClose={() => {
					setOrgUnits(!orgUnits);
				}}
				onUpdate={async (val: any) => {
					setOrgUnits(!orgUnits);
					console.log(val.orgUnits);
					onChange({ value: val.orgUnits });
				}}
			/>
			<PeriodSelectorModal
				enablePeriodSelector
				hide={periods}
				onClose={() => {
					setPeriods(!periods);
				}}
				onUpdate={async (val: any) => {
					setPeriods(!periods);
					console.log(val);
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
									onClick={() => {
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
