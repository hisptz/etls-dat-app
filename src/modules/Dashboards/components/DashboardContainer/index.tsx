import React from "react";
import { useDefaultDashboardData } from "../../hooks/data";

export default function DashboardContainer(): React.ReactElement {
	const {
		loadingEnrollemntStatus,
		loadingAdherenceSummary,
		enrollemntStatusError,
		adherenceSummaryError,
		enrollmentSummary,
		adherenceSummary,
	} = useDefaultDashboardData();

	if (enrollemntStatusError) {
		return <h3>Error</h3>;
	}

	if (adherenceSummaryError) {
		return <h3>Error</h3>;
	}

	if (loadingEnrollemntStatus || loadingAdherenceSummary) {
		return <h3>Loading...</h3>;
	} else {
		console.log({ enrollmentSummary, adherenceSummary });
		return <>Dashboards here</>;
	}
}
