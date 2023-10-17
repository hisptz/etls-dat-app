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
import { DATA_TEST_PREFIX, deviceEmeiList } from "../../../../shared/constants";
import { Option } from "../hooks/data";

export interface FilterFieldProps {
	name: string;
	label: string;
	required?: boolean;
	initialValue?: string;
	options?: [{ name: string; code: string }] | Option[] | deviceEmeiList[];
	update?: (val: number) => void;
	type: "date" | "text" | "select" | "time";
	multiSelect?: boolean;
}

export function FilterField({
	name,
	label,
	required,
	options,
	initialValue,
	type,
	multiSelect,
}: FilterFieldProps) {
	const [params, setParams] = useSearchParams();
	const value = params.get(name) ?? initialValue;
	const onChange = ({ value }: { value: string }) => {
		setParams((params) => {
			const updatedParams = new URLSearchParams(params);
			updatedParams.set(name, value);

			return updatedParams;
		});
	};

	if (type === "select") {
		if (multiSelect) {
			return (
				<MultiSelectField
					dataTest={`${DATA_TEST_PREFIX}-${name}`}
					id={name}
					clearable
					required={required}
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
				required={required}
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
		<InputField
			type={type}
			inputWidth={type == "time" ? "120px" : null}
			required={required}
			onChange={onChange}
			value={value}
			name={name}
			label={label}
		/>
	);
}
