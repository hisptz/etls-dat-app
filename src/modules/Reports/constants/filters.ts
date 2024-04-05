import { useSetting } from "@dhis2/app-service-datastore";
import { head, orderBy } from "lodash";

export function getDefaultReportFilters() {
	const [programMapping] = useSetting("programMapping", { global: true });
	const defaultProgram = head(orderBy(programMapping, "name"))?.program;
	return new URLSearchParams({
		program: defaultProgram ?? "",
	});
}
