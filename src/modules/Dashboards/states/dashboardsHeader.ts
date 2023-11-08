import { atom, selector } from "recoil";
import { CurrentUserSelector } from "../../shared/state/currentUser";
import { DimensionFilter } from "../../shared/interfaces";

export const DefaultDashboardFilter = selector({
	key: "default-dashboard-filters",
	get: async ({ get }) => {
		const currentUser = await get(CurrentUserSelector);

		return {
			orgUnit: {
				orgUnits: currentUser ? currentUser?.organisationUnits : "",
			},
			periods: ["THIS_MONTH"],
		};
	},
});

export const DashboardFilterState = atom<DimensionFilter>({
	key: "dashboard-filter-state",
	default: DefaultDashboardFilter,
});
