import React from "react";
import { useRecoilState } from "recoil";
import { DashboardFilterState } from "../../states/dashboardsHeader";
import FilterButton from "../FilterButton";

export default function DashboardHeader(): React.ReactElement {
	const [filter, setFilter] = useRecoilState(DashboardFilterState);

	return (
		<>
			<div>
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
			</div>
		</>
	);
}
