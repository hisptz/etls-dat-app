import { selector } from "recoil";
import { CurrentUser, OrganisationUnitSelection } from "../types/user";
import { DataEngineState } from "./engine";
import { CURRENT_USER_QUERY, MANAGER_USER_GROUP_CODE } from "../constants";

export const CurrentUserSelector = selector<CurrentUser | undefined>({
	key: "current-user-selector",
	get: async ({ get }) => {
		const engine: any = get(DataEngineState);
		const currentUser = await engine?.query(CURRENT_USER_QUERY);
		return currentUser?.me;
	},
});

export const CurrentUserOrganizationUnit = selector<
	OrganisationUnitSelection[]
>({
	key: "current-user-organisation-unit",
	get: async ({ get }) => {
		const currentUser = get(CurrentUserSelector);
		return currentUser ? currentUser?.organisationUnits ?? [] : [];
	},
});

export const CurrentUserGroup = selector<any[]>({
	key: "current-user-group",
	get: async ({ get }) => {
		const currentUser = get(CurrentUserSelector);
		return currentUser ? currentUser?.userGroups ?? [] : [];
	},
});

export const CanManageDAT = selector<boolean>({
	key: "current-user-manager",
	get: ({ get }) => {
		const groups = get(CurrentUserGroup);
		return groups.some((group) => group.code === MANAGER_USER_GROUP_CODE);
	},
});
