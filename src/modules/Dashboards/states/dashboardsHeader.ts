import { atom, selector } from "recoil";
import { CurrentUserOrganizationUnit } from "../../shared/state/currentUser";
import { DimensionFilter } from "../../shared/interfaces";
import { DEFAULT_DASHBOARD_PERIOD } from "../../shared/constants";

export const DefaultDashboardFilter = selector<DimensionFilter>({
	key: "default-dashboard-filters",
	get: async ({ get }) => {
		const currentUserOrganisationUnit = get(CurrentUserOrganizationUnit);

		return {
			orgUnit: {
				orgUnits: currentUserOrganisationUnit ?? [],
			},
			periods: [DEFAULT_DASHBOARD_PERIOD],
		};
	},
});

export const DashboardFilterState = atom<DimensionFilter>({
	key: "dashboard-filter-state",
	default: DefaultDashboardFilter,
});
