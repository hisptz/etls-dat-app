export const TEI_PAGE_SIZE = 500;

export const TRACKED_ENTITY_INSTANCE_QUERY = {
	query: {
		resource: "trackedEntityInstances",
		params: ({ program, page, ou, startDate, endDate }: any) => ({
			program,
			ou,
			totalPages: false,
			page: page ?? 1,
			pageSize: TEI_PAGE_SIZE,
			programStartDate: startDate,
			programEndDate: endDate,
			ouMode: "DESCENDANTS",
			fields: [
				"trackedEntityInstance",
				"orgUnit",
				"created",
				"attributes[attribute,value]",
				"enrollments[enrollmentDate,orgUnitName,events[event,eventDate,programStage,dataValues[dataElement,value]]]",
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
