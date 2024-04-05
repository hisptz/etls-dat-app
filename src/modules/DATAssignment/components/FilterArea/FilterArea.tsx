import React from "react";
import { Box, Button, ButtonStrip, Card, IconSearch24 } from "@dhis2/ui";
import { PropertiesFilter } from "./components/PropertiesFilter";
import i18n from "@dhis2/d2-i18n";
import { useSearchParams } from "react-router-dom";
import { useDataQuery } from "@dhis2/app-runtime";
import { useFilters } from "../Table/hooks/data";
import { useSetting } from "@dhis2/app-service-datastore";
import { isEmpty } from "lodash";
import { OrganizationUnitState } from "../../state/filters";
import { useRecoilState, useRecoilValue } from "recoil";
import { getResetDATOverviewFilters } from "../../constants/filters";
import { CurrentUserOrganizationUnit } from "../../../shared/state/currentUser";

export interface FilterAreaProps {
	loading: boolean;
	onFetch: ReturnType<typeof useDataQuery>["refetch"];
}

export function FilterArea({ loading, onFetch }: FilterAreaProps) {
	const [params, setParams] = useSearchParams();
	const { filters } = useFilters();
	const [programMapping] = useSetting("programMapping", { global: true });
	const [, setOrganizationUnitState] = useRecoilState(OrganizationUnitState);
	const defaultOrganizationUnit = useRecoilValue(CurrentUserOrganizationUnit);

	const currentProgram = params.get("program");

	const orgUnit =
		params.get("ou") ??
		defaultOrganizationUnit.map(({ id }) => id).join(";");
	const onFilterClick = () => {
		onFetch({
			page: 1,
			filters,
			orgUnit,
		});
	};

	const onResetClick = () => {
		const defaultValue = getResetDATOverviewFilters(
			currentProgram ?? undefined,
		);

		setParams(defaultValue);
		setOrganizationUnitState([]);
		onFetch({
			page: 1,
			filters: [],
			orgUnit: defaultOrganizationUnit.map(({ id }) => id).join(";"),
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
							disabled={isEmpty(programMapping)}
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
