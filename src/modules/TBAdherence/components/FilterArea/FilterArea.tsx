import React from "react";
import { Box, Button, ButtonStrip, Card, IconSearch24 } from "@dhis2/ui";
import { PropertiesFilter } from "./components/PropertiesFilter";
import i18n from "@dhis2/d2-i18n";
import { getDefaultFilters } from "./constants/filters";
import { useSearchParams } from "react-router-dom";
import { useDataQuery } from "@dhis2/app-runtime";
import { useFilters } from "../Table/hooks/data";
import { useSetting } from "@dhis2/app-service-datastore";
import { isEmpty } from "lodash";
import { OrganizationUnitState } from "../../state/filters";
import { useRecoilState } from "recoil";

export interface FilterAreaProps {
	loading: boolean;
	onFetch: ReturnType<typeof useDataQuery>["refetch"];
}

export function FilterArea({ loading, onFetch }: FilterAreaProps) {
	const [params, setParams] = useSearchParams();
	const { filters, startDate } = useFilters();
	const [programMapping] = useSetting("programMapping", { global: true });
	const [, setOrganizationUnitState] = useRecoilState(OrganizationUnitState);

	const orgUnit = params.get("ou") ?? null;
	const onFilterClick = () => {
		onFetch({
			page: 1,
			filters,
			startDate,
			orgUnit,
		});
	};

	const defaultOrg = {
		id: "CAWjYmd5Dea",
		displayName: "United Republic of Tanzania",
		path: "/CAWjYmd5Dea",
		children: [],
	};

	const onResetClick = () => {
		const defaultValue = getDefaultFilters();
		setParams(defaultValue);
		setOrganizationUnitState([defaultOrg]);
		onFetch({
			page: 1,
			filters: [],
			startDate,
			orgUnit: defaultOrg.id,
		});
	};

	return (
		<Box width="100%">
			<Card>
				<div className="column gap-16 p-16">
					<PropertiesFilter />

					<ButtonStrip>
						<Button onClick={onResetClick}>
							{i18n.t("Reset")}
						</Button>
						<Button
							disabled={isEmpty(programMapping.program)}
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
