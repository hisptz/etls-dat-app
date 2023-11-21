export interface CurrentUser {
	id?: string;
	name?: string;
	userGroups?: Array<{
		id: string;
	}>;
	organisationUnits?: Array<OrganisationUnitSelection>;
}

export interface OrganisationUnitSelection {
	id: string;
	path: string;
	displayName: string;
}
