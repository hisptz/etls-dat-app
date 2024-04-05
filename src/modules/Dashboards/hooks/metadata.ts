import { useSetting } from "@dhis2/app-service-datastore";

export function useDashboardMetadata() {
	const [dashboards] = useSetting("dashboards");
	return dashboards ?? [];
}
