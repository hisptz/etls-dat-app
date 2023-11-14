import React from "react";
import { useDefaultDashboardData } from "../../hooks/data";

export default function DashboardContainer(): React.ReactElement {
	const { loading, error } = useDefaultDashboardData();

	if (error) {
		return <h3>Error</h3>;
	}

	if (loading) {
		return <h3>Loading...</h3>;
	}

	return <>Dashboards here</>;
}