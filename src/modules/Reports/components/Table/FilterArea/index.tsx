import React, { useState } from "react";
import i18n from "@dhis2/d2-i18n";
import { Divider } from "@dhis2/ui";
import { useDataQuery } from "@dhis2/app-runtime";
import { useSearchParams } from "react-router-dom";
import Download from "../../../Download";
import { FilterField } from "./components/FilterField";

interface FilterAreaProps {
	value: string;
	loading: boolean;
	onFetch: ReturnType<typeof useDataQuery>["refetch"];
	show: () => void;
}

export default function FilterArea({
	value,
	show,
	onFetch,
	loading,
}: FilterAreaProps) {
	const [params, setParams] = useSearchParams();

	const orgUnit = params.get("ou");
	const [index, setIndex] = useState<number>();
	const onFilterClick = () => {
		onFetch({
			page: 1,
			orgUnit,
		});
	};
	const onChange = ({ value }: { value: number }) => {
		setParams((params) => {
			const updatedParams = new URLSearchParams(params);
			if (value != undefined) {
				updatedParams.set("index", value.toString());
			}

			return updatedParams;
		});
	};

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "start",
				padding: "0px 16px 16px 16px",
				borderBottom: "2px solid #d8e0e7",
			}}
		>
			<FilterField name="reportType" label="Report" type="report" />
			<FilterField
				name="ou"
				label="Organisation units"
				type="organisation units"
			/>
			<FilterField name="periods" label="Periods" type="periods" />
		</div>
	);
}
