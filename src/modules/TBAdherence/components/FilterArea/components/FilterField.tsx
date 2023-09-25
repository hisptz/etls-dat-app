import React from "react";
import { InputField } from "@dhis2/ui";
import { useSearchParams } from "react-router-dom";

export interface FilterFieldProps {
	name: string;
	label: string;
	options?: string[];
	type: "orgUnit" | "text" | "select";
	multiSelect?: boolean;
}

export function FilterField({ name, label, type }: FilterFieldProps) {
	const [params, setParams] = useSearchParams();
	const value = params.get(name);
	const onChange = ({ value }: { value: string }) => {
		setParams((params) => {
			const updatedParams = new URLSearchParams(params);
			updatedParams.set(name, value);
			return updatedParams;
		});
	};

	if (type === "orgUnit") {
		return null;
	}

	return (
		<InputField
			type={type}
			onChange={onChange}
			value={value}
			name={name}
			label={label}
		/>
	);
}
