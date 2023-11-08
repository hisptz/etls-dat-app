import { OrgUnitSelection } from "@hisptz/dhis2-utils";

export interface DimensionFilter {
	orgUnit?: OrgUnitSelection;
	periods?: any[];
	[key: string]: any;
}

export interface Query {
	[key: string]: {
		resource: string;
		id?: string | ((data: any) => string);
		params?: {
			[key: string]: any;
		};
	};
}
