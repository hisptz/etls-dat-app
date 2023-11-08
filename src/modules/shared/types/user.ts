export interface CurrentUser {
    id?: string;
    name?: string;
    userGroups?: Array<{
        id: string
    }>;
    organisationUnits?:Array<{
        id: string;
        path: string;
        displayName: string;
    }>
}