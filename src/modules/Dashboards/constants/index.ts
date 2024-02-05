export const DEFAULT_PAGE_SIZE = 1000;

export const TRACKED_ENTITY_INSTANCE_QUERY = {
	query: {
		resource: "trackedEntityInstances",
		params: ({ program, page, ou, startDate, endDate }: any) => ({
			program,
			ou,
			totalPages: false,
			page: page ?? 1,
			pageSize: DEFAULT_PAGE_SIZE,
			programStartDate: startDate,
			programEndDate: endDate,
			ouMode: "DESCENDANTS",
			fields: [
				"trackedEntityInstance",
				"orgUnit",
				"created",
				"attributes[attribute,value]",
			],
		}),
	},
};

export const TRACKED_ENTITY_INSTANCE_PAGINATION_QUERY = {
	query: {
		resource: "trackedEntityInstances",
		params: ({ ou, program, startDate, endDate }: any) => ({
			ou,
			program,
			ouMode: "DESCENDANTS",
			totalPages: true,
			programStartDate: startDate,
			programEndDate: endDate,
			pageSize: 1,
			page: 1,
			fields: ["trackedEntityInstance"],
		}),
	},
};

export const TRACKED_ENTITY_ATTRIBUTE_QUERY = {
	query: {
		resource: "trackedEntityAttributes",
		id: ({ id }: any) => id,
		params: {
			fields: ["id", "name", "optionSet[options[name,code]]"],
		},
	},
};

export const DEVICE_USAGE_DASHBOARD_ITEM_ID = "device-usage";
export const DAT_ENROLLMENT_DASHBOARD_ITEM_ID = "dat-enrollment";
export const ADHERENCE_PERCENTAGE_DASHBOARD_ITEM_ID = "adherence-percentage";
