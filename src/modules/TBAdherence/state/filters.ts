import { atom } from "recoil";
import { OrganisationUnit } from "@hisptz/dhis2-utils";

export const OrganizationUnitState = atom<OrganisationUnit[]>({
	key: "organization-unit-state",
	default: [
		{
			id: " ",
			displayName: " ",
			path: "/ ",
			children: [],
		},
	],
});
