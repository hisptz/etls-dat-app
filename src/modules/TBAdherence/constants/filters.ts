import { DateTime } from "luxon";

export function getDefaultTBAdherenceFilters() {
	const endDate = DateTime.now();
	const startDate = endDate.minus({ year: 1 });
	return new URLSearchParams({
		startDate: startDate.toFormat("yyyy-MM-dd"),
		ou: "CAWjYmd5Dea",
	});
}
