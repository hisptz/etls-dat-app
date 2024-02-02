import React, { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { PeriodUtility } from "@hisptz/dhis2-utils";
import { useSearchParams } from "react-router-dom";
import { Button, IconEdit24 } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";

import { DashboardFilterState } from "../../states/dashboardsHeader";
import FilterButton from "../FilterButton";
import EditCustomDashboardsForm from "../EditDashboardsForm";
import { CanManageDAT } from "../../../shared/state/currentUser";

export default function DashboardHeader(): React.ReactElement {
	const [params] = useSearchParams();
	const canManageDashboards = useRecoilValue(CanManageDAT);
	const [showDashboardsModel, setShowDashboardModel] = useState(false);
	const [filter, setFilter] = useRecoilState(DashboardFilterState);
	const { orgUnit: ouSelection, period: periodSelection } = filter;

	const selectedOrgUnit = (ouSelection?.orgUnits ?? [])
		.map(({ displayName }) => displayName)
		.join(", ");
	const pe = params.get("pe");
	const selectedPeriod = (
		pe ? pe.split(";") : periodSelection ?? ["THIS_YEAR"]
	)
		.map((pe: string) => PeriodUtility.getPeriodById(pe).name)
		.join(", ");

	const onToggleDashboardEditModal = () =>
		setShowDashboardModel(!showDashboardsModel);

	return (
		<div className="flex gap-32 w-100 align-center">
			<>
				{canManageDashboards && (
					<Button
						icon={<IconEdit24 />}
						onClick={onToggleDashboardEditModal}
					>
						{i18n.t("Edit Dashboard")}
					</Button>
				)}
			</>
			<FilterButton
				filter={filter}
				onFilterChange={setFilter}
				orgUnitProps={{
					singleSelection: true,
				}}
				periodProps={{
					enablePeriodSelector: true,
					singleSelection: true,
					enableDateRange: false,
					excludeRelativePeriods: false,
					excludedPeriodTypes: ["Weekly"],
				}}
			/>
			<div className="flex gap-16">
				<div
					style={{
						backgroundColor: "#212934",
						padding: "9px 20px 9px 20px",
						borderRadius: "5px",
					}}
				>
					<span style={{ color: "white" }}>
						Organization unit:{" "}
						<span className="bold">{selectedOrgUnit}</span>
					</span>
				</div>

				<div
					style={{
						backgroundColor: "#212934",
						padding: "9px 20px 9px 20px",
						borderRadius: "5px",
					}}
				>
					<span style={{ color: "white" }}>
						Period: <span className="bold">{selectedPeriod}</span>
					</span>
				</div>

				<EditCustomDashboardsForm
					hide={!showDashboardsModel}
					onClose={onToggleDashboardEditModal}
				/>
			</div>
		</div>
	);
}
