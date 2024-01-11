import { useSetting } from "@dhis2/app-service-datastore";
import { head } from "lodash";
import { DateTime } from "luxon";

export function getDefaultDATOverviewFilters() {
	const endDate = DateTime.now();
	const startDate = endDate.minus({ year: 1 });
	const [programMapping] = useSetting("programMapping", { global: true });
	const defaultProgram = head(programMapping)?.program;
	return new URLSearchParams({
		// TODO remove the date
		startDate: startDate.toFormat("yyyy-MM-dd"),
		program: defaultProgram ?? "",
	});
}

export function getResetDATOverviewFilters(program?: string) {
	const endDate = DateTime.now();
	const startDate = endDate.minus({ year: 1 });
	return new URLSearchParams({
		// TODO remove the date
		startDate: startDate.toFormat("yyyy-MM-dd"),
		program: program ?? "",
	});
}
