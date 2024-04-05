import React from "react";
import i18n from "@dhis2/d2-i18n";
import { FilterField } from "../../../../Configuration/components/ProgramMapping/components/FilterField";

export default function VisualizationSpanField(): React.ReactElement {
	return (
		<FilterField
			required={true}
			name="span"
			label={i18n.t("Span")}
			type="number"
		/>
	);
}
