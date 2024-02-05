import { OrgUnitSelection } from "@hisptz/dhis2-utils";

export interface DashboardItem {
	id: string;
	span: number;
	type: "visualization" | "custom";
	options?: {
		renderAs?: "singleValue" | "progress" | "pie";
		title: string;
	};
	program?: string;
}

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
