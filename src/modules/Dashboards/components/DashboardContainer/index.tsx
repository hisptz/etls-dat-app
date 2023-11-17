import React from "react";
import { useDefaultDashboardData } from "../../hooks/data";

export default function DashboardContainer(): React.ReactElement {
	const {
		loadingEnrollemntStatus,
		loadingAdherenceSummary,
		enrollemntStatusError,
	} = useDefaultDashboardData();

	if (enrollemntStatusError) {
		return <h3>Error</h3>;
	}

	if (loadingEnrollemntStatus || loadingAdherenceSummary) {
		return <h3>Loading...</h3>;
	}

	return <>Dashboards here</>;
}
