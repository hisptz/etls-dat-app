import { DateTime } from "luxon";

export function getDefaultFilters() {
	const endDate = DateTime.now();
	const startDate = endDate.minus({ week: 1 });
	return new URLSearchParams({
		endDate: endDate.toFormat("yyyy-MM-dd"),
		startDate: startDate.toFormat("yyyy-MM-dd"),
	});
}
