import React from "react";
import { useRecoilState } from "recoil";
import { DashboardFilterState } from "../../states/dashboardsHeader";
import FilterButton from "../FilterButton";
import { PeriodUtility } from "@hisptz/dhis2-utils";
import { useSearchParams } from "react-router-dom";

export default function DashboardHeader(): React.ReactElement {
	const [params] = useSearchParams();
	const [filter, setFilter] = useRecoilState(DashboardFilterState);
	const { orgUnit: ouSelection, period: periodSelection } = filter;

	const selectedOrgUnit = (ouSelection?.orgUnits ?? [])
		.map(({ displayName }) => displayName)
		.join(", ");
	const pe = params.get("pe");
	const selectedPeriod = (
		pe ? pe.split(";") : periodSelection ?? ["THIS_MONTH"]
	)
		.map((pe: string) => PeriodUtility.getPeriodById(pe).name)
		.join(", ");

	return (
		<div className="flex gap-32 w-100 align-center">
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
			</div>
		</div>
	);
}
