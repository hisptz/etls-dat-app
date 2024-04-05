import React from "react";
import {
	InputField,
	MultiSelectField,
	MultiSelectOption,
	SingleSelectField,
	SingleSelectOption,
} from "@dhis2/ui";
import { useSearchParams } from "react-router-dom";
import { isEmpty } from "lodash";
import { DATA_TEST_PREFIX, DeviceIMEIList } from "../../../../shared/constants";
import { Option } from "../hooks/data";
import { useController } from "react-hook-form";

export interface FilterFieldProps {
	name: string;
	label: string;
	required?: boolean;
	validations?: Record<string, any>;
	initialValue?: string;
	options?: { name: string; code: string }[] | Option[] | DeviceIMEIList[];
	update?: (val: number) => void;
	type: "date" | "text" | "select" | "time" | "password" | "number";
	multiSelect?: boolean;
	loading?: boolean;
	width?: string;
	disabled?: boolean;
}

export function FilterField({
	name,
	label,
	required,
	validations,
	options,
	initialValue,
	type,
	width,
	multiSelect,
	...props
}: FilterFieldProps) {
	const [, setParams] = useSearchParams();
	const onChange = ({ value }: { value: string }) => {
		setParams((params) => {
			const updatedParams = new URLSearchParams(params);
			updatedParams.set(name, value);

			return updatedParams;
		});
	};

	const { field, fieldState } = useController({
		name,
		rules: validations,
	});

	if (type === "select") {
		if (multiSelect) {
			return (
				<MultiSelectField
					{...props}
					dataTest={`${DATA_TEST_PREFIX}-${name}`}
					id={name}
					clearable
					error={!!fieldState.error}
					validationText={fieldState.error?.message}
					required={required}
					selected={
						isEmpty(field.value) ? [] : field.value?.split(",")
					}
					filterable={(options?.length ?? 0) > 5}
					onChange={({ selected }: { selected: string[] }) => {
						field.onChange(selected);
					}}
					value={field.value}
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
				{...props}
				dataTest={`${DATA_TEST_PREFIX}-${name}`}
				id={name}
				clearable
				error={!!fieldState.error}
				validationText={fieldState.error?.message}
				selected={
					options?.some(({ code }) => code === field.value)
						? field.value
						: undefined
				}
				required={required}
				filterable={(options?.length ?? 0) > 5}
				onChange={({ selected }: { selected: string }) => {
					field.onChange(selected);
				}}
				value={field.value}
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
		<InputField
			{...props}
			type={type}
			error={!!fieldState.error}
			validationText={fieldState.error?.message}
			inputWidth={type == "time" ? width : null}
			required={required}
			onChange={({ value }) => {
				field.onChange(
					type == "number" ? parseInt(value ? value : "0") : value,
				);
			}}
			value={field.value}
			name={name}
			label={label}
		/>
	);
}
