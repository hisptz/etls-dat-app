import { useSetting } from "@dhis2/app-service-datastore";
import { isEmpty } from "lodash";
import { DateTime } from "luxon";

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
		// TODO remove the date
		startDate: startDate.toFormat("yyyy-MM-dd"),
	});
}
