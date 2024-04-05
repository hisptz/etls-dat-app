import { atom } from "recoil";
import { OrganisationUnitSelection } from "../../shared/types/user";


export const OrganizationUnitState = atom<OrganisationUnitSelection[]>({
	key: "organization-unit-state",
	default: [
		{
			id: " ",
			displayName: " ",
			path: "/ ",
		},
	],
});
