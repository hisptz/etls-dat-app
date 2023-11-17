export const DEFAULT_PAGE_SIZE = 500;

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

export const EVENTS_QUERY = {
	query: {
		resource: "events",
		params: ({ programStage, page, orgUnit, startDate, endDate }: any) => ({
			programStage,
			orgUnit,
			startDate,
			endDate,
			totalPages: false,
			page: page ?? 1,
			pageSize: DEFAULT_PAGE_SIZE,
			ouMode: "DESCENDANTS",
			fields: [
				"event",
				"trackedEntityInstance",
				"eventDate",
				"dataValues[dataElement,value]",
			],
		}),
	},
};

export const EVENTS_PAGINATION_QUERY = {
	query: {
		resource: "events",
		params: ({ orgUnit, programStage, startDate, endDate }: any) => {
			return {
				orgUnit,
				programStage,
				startDate,
				endDate,
				ouMode: "DESCENDANTS",
				totalPages: true,
				pageSize: 1,
				page: 1,
				fields: ["event"],
			};
		},
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
