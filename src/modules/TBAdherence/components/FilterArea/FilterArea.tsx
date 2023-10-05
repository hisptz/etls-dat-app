import React from "react";
import { Box, Button, ButtonStrip, Card, IconSearch24 } from "@dhis2/ui";

import { PropertiesFilter } from "./components/PropertiesFilter";
import i18n from "@dhis2/d2-i18n";
import { getDefaultFilters } from "./constants/filters";
import { useSearchParams } from "react-router-dom";
import { useDataQuery } from "@dhis2/app-runtime";
import { useFilters } from "../Table/hooks/data";
import { OrganizationUnitState } from "../../state/filters";
import { useRecoilState } from "recoil";

export interface FilterAreaProps {
	loading: boolean;
	onFetch: ReturnType<typeof useDataQuery>["refetch"];
}

export function FilterArea({ loading, onFetch }: FilterAreaProps) {
	const [params, setParams] = useSearchParams();
	const { filters, endDate, startDate } = useFilters();

	const orgUnit = params.get("ou") ?? null;
	const onFilterClick = () => {
		onFetch({
			page: 1,
			filters,
			endDate,
			startDate,
			orgUnit,
		});
	};
	const onResetClick = () => {
		const defaultValue = getDefaultFilters();
		setParams(defaultValue);
	};

	return (
		<Box width="100%">
			<Card>
				<div className="column gap-16 p-16">
					<PropertiesFilter />
					<br />
					<ButtonStrip>
						<Button onClick={onResetClick}>
							{i18n.t("Reset")}
						</Button>
						<Button
							loading={loading}
							onClick={onFilterClick}
							primary
							icon={<IconSearch24 />}
						>
							{loading
								? i18n.t("Searching...")
								: i18n.t("Search")}
						</Button>
					</ButtonStrip>
				</div>
			</Card>
		</Box>
	);
}
