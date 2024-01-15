import { useSetting } from "@dhis2/app-service-datastore";
import { head } from "lodash";
import { DateTime } from "luxon";

export function getDefaultDATOverviewFilters() {
	const endDate = DateTime.now();
	const startDate = endDate.minus({ year: 5 }).toFormat("yyyy-MM-dd");
	const [programMapping] = useSetting("programMapping", { global: true });
	const defaultProgram = head(programMapping)?.program;
	return new URLSearchParams({
		// TODO remove the date
		startDate: "2020-01-01",
		program: defaultProgram ?? "",
	});
}

export function getResetDATOverviewFilters(program?: string) {
	const endDate = DateTime.now();
	const startDate = endDate.minus({ year: 5 }).toFormat("yyyy-MM-dd");
	return new URLSearchParams({
		// TODO remove the date
		startDate: "2020-01-01",
		program: program ?? "",
	});
}
