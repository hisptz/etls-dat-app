import { OrgUnitSelection } from "@hisptz/dhis2-utils";

export interface DashboardItem {
	id: string;
	span: number;
	type: "visualization" | "custom";
	options?: {
		title?: string;
		renderAs?: string;
		chartType?: string;
		filters?: Record<string, any>;
		dimensions?: Record<string, any>;
		columns?: Record<string, any>;
		rows?: Record<string, any>;
		series?: Record<string, any>;
		category?: Record<string, any>;
	};
	sortOrder?: number;
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
