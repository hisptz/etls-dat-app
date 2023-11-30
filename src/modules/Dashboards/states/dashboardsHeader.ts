import { atom, selector } from "recoil";
import { CurrentUserOrganizationUnit } from "../../shared/state/currentUser";
import { DimensionFilter } from "../../shared/interfaces";

export const DefaultDashboardFilter = selector<DimensionFilter>({
	key: "default-dashboard-filters",
	get: async ({ get }) => {
		const currentUserOrganisationUnit =  get(CurrentUserOrganizationUnit);

		return {
			orgUnit: {
				orgUnits: currentUserOrganisationUnit ?? [],
			},
			periods: ["THIS_MONTH"],
		};
	},
});

export const DashboardFilterState = atom<DimensionFilter>({
	key: "dashboard-filter-state",
	default: DefaultDashboardFilter,
});
