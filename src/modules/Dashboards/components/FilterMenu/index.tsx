import React from "react";
import {
	FlyoutMenu,
	IconClock16,
	IconDimensionOrgUnit16,
	MenuItem,
	MenuSectionHeader,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";

export function FilterMenu({
	onMenuClick,
}: {
	onMenuClick: (value: string) => void;
}): React.ReactElement {
	return (
		<FlyoutMenu>
			<MenuSectionHeader label={i18n.t("Filters")} />
			<MenuItem
				onClick={() => onMenuClick("period")}
				icon={<IconClock16 />}
				label={i18n.t("Period")}
			/>
			<MenuItem
				onClick={() => onMenuClick("orgUnit")}
				icon={<IconDimensionOrgUnit16 />}
				label={i18n.t("Organisation Unit")}
			/>
		</FlyoutMenu>
	);
}
