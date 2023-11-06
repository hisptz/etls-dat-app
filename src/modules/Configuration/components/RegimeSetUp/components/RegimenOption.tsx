import React, { useEffect } from "react";
import { FilterField } from "../../ProgramMapping/components/FilterField";
import { Option, useRegimens } from "../hooks/data";
import i18n from "@dhis2/d2-i18n";
import { RegimenFormData } from "./EditRegimen";

function RegimenOption({
	addNew,
	data,
}: {
	addNew: boolean;
	data?: RegimenFormData;
}) {
	const { regimenOptions, loading } = useRegimens();

	const currentRegimen: Option[] = [
		{
			name: data?.regimen ?? "",
			code: data?.regimen ?? "",
			displayName: data?.regimen ?? "",
			id: data?.regimen ?? "",
		},
	];

	return (
		<FilterField
			loading={loading}
			options={addNew ? regimenOptions : currentRegimen}
			label={i18n.t("Regimen")}
			name="regimen"
			type="select"
			required
		/>
	);
}

export default RegimenOption;
