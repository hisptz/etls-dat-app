import { useSetting } from "@dhis2/app-service-datastore";
import { isEmpty } from "lodash";

export function getDefaultReportFilters() {
	const [programMapping] = useSetting("programMapping", {
		global: true,
	});

	const defautProgram = !isEmpty(programMapping)
		? programMapping[0].program
		: "";
	return new URLSearchParams({
		program: defautProgram,
	});
}
