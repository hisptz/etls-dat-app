import { useSetting } from "@dhis2/app-service-datastore";
import { isEmpty } from "lodash";
import { DateTime } from "luxon";

// TODO remove hardcoded ids
export function getDefaultTBAdherenceFilters() {
	const [programMapping] = useSetting("programMapping", {
		global: true,
	});
	const endDate = DateTime.now();
	const startDate = endDate.minus({ year: 1 });
	const defautProgram = !isEmpty(programMapping)
		? programMapping[0].program
		: "";
	return new URLSearchParams({
		startDate: startDate.toFormat("yyyy-MM-dd"),
		ou: "CAWjYmd5Dea",
		program: defautProgram,
	});
}
