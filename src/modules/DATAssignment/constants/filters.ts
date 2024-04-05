import { useSetting } from "@dhis2/app-service-datastore";
import { head } from "lodash";

export function getDefaultDATOverviewFilters() {
	const [programMapping] = useSetting("programMapping", { global: true });
	const defaultProgram = head(programMapping)?.program;
	return new URLSearchParams({
		program: defaultProgram ?? "",
	});
}

export function getResetDATOverviewFilters(program?: string) {
	return new URLSearchParams({
		program: program ?? "",
	});
}
