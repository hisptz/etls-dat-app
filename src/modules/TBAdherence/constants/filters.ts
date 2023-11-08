import { DateTime } from "luxon";

// TODO remove hardcoded ids
export function getDefaultTBAdherenceFilters() {
	const endDate = DateTime.now();
	const startDate = endDate.minus({ year: 1 });
	return new URLSearchParams({
		startDate: startDate.toFormat("yyyy-MM-dd"),
		ou: "CAWjYmd5Dea",
	});
}
