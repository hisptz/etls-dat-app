export interface CurrentUser {
	id?: string;
	name?: string;
	userGroups?: Array<{
		id: string;
		code: string;
	}>;
	organisationUnits?: Array<OrganisationUnitSelection>;
}

export interface OrganisationUnitSelection {
	id: string;
	path: string;
	displayName: string;
}
