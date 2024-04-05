export type DashboardItem = {
	id: string;
	span: number;
	type: "custom" | "visualization" | "indicator";
	options: DashboardItemOptions;
	program: string;
	migrated: boolean;
};

export type DashboardItemOptions = {
	title: string;
	renderAs: string;
};
