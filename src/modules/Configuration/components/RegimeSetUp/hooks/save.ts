import { useSetting } from "@dhis2/app-service-datastore";

export function getEditFilters(index?: number) {
	const [settings] = useSetting("regimenSetting", {
		global: true,
	});
	if (index != undefined) {
		return new URLSearchParams({
			regimen: settings[index ?? 0].regimen ?? "",
			administration: settings[index ?? 0].administration ?? "",
			idealDoses: settings[index ?? 0].idealDoses ?? "",
			idealDuration: settings[index ?? 0].idealDuration ?? "",
			completionMinimumDoses:
				settings[index ?? 0].completionMinimumDoses ?? "",
			completionMaximumDuration:
				settings[index ?? 0].completionMaximumDuration ?? "",
		});
	} else {
		return new URLSearchParams({});
	}
}
