import React from "react";
import { DashboardItem } from "../../../../../shared/interfaces";

export default function D2VisualizationContainer(
	config: DashboardItem,
): React.ReactElement {
	console.log({ config });
	return <div>DHIS2 visualization</div>;
}
