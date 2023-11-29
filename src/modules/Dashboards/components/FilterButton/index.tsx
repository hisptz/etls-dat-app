import React, { useState } from "react";
import { isEmpty, map } from "lodash";
import {
	PeriodSelectorModal,
	CustomOrgUnitProvider,
	OrgUnitSelectorModal,
} from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { OrgUnitSelection } from "@hisptz/dhis2-utils";
import { DropdownButton, IconFilter24 } from "@dhis2/ui";

import { DimensionFilter } from "../../../shared/interfaces";
import { FilterMenu } from "../FilterMenu";
import { useSearchParams } from "react-router-dom";

export default function FilterButton({
	filter,
	onFilterChange,
	orgUnitProps,
	periodProps,
	label,
}: {
	filter: DimensionFilter;
	onFilterChange: (filter: DimensionFilter) => void;
	label?: string;
	orgUnitProps?: Record<string, any>;
	periodProps?: Record<string, any>;
}): React.ReactElement {
	const [, setSearchParams] = useSearchParams();
	const [filterOpen, setFilterOpen] = useState<string | undefined>();
	const [menuOpen, setMenuOpen] = useState(false);
	const { orgUnit: orgUnitSelection, periods: periodSelection } =
		filter ?? {};

	// Setting search params
	const updateSearchParams = (key: string, value: string) => {
		setSearchParams((params) => {
			const updatedParams = new URLSearchParams(params);
			updatedParams.set(key, value);
			return updatedParams;
		});
	};

	// Filter methods
	const onPeriodChange = (period: any) => {
		if (!isEmpty(period)) {
			updateSearchParams("pe", period.join(";"));
			onFilterChange({ ...filter, periods: period });
		}
	};

	const onOrgUnitChange = (orgUnit: OrgUnitSelection) => {
		if (!isEmpty(orgUnit.orgUnits)) {
			const ouIds = map(orgUnit.orgUnits, ({ id }) => id);
			updateSearchParams("ou", ouIds.join(";"));
			onFilterChange({ ...filter, orgUnit });
		}
	};

	const onFilterClick = (value: string) => {
		setFilterOpen(value);
		setMenuOpen(false);
	};

	const onChange = (setter: (value: any) => any) => (value: any) => {
		setter(value);
		onClose();
	};

	const onClose = () => setFilterOpen(undefined);

	return (
		<div>
			<DropdownButton
				open={menuOpen}
				onClick={() => setMenuOpen((prevState) => !prevState)}
				component={<FilterMenu onMenuClick={onFilterClick} />}
				icon={<IconFilter24 />}
			>
				{label ?? i18n.t("Add filters")}
			</DropdownButton>
			{filterOpen === "period" && (
				<PeriodSelectorModal
					{...periodProps}
					position="middle"
					selectedPeriods={periodSelection}
					onClose={onClose}
					hide={filterOpen !== "period"}
					onUpdate={onChange(onPeriodChange)}
				/>
			)}
			{filterOpen === "orgUnit" && (
				<CustomOrgUnitProvider>
					<OrgUnitSelectorModal
						{...orgUnitProps}
						position="middle"
						value={orgUnitSelection as any}
						onClose={onClose}
						hide={filterOpen !== "orgUnit"}
						onUpdate={onChange(onOrgUnitChange)}
					/>
				</CustomOrgUnitProvider>
			)}
		</div>
	);
}
