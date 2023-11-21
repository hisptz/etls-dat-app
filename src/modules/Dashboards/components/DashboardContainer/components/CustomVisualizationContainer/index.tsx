import React from "react";
import { DashboardItem } from "../../../../../shared/interfaces";
import DashboardLoader from "../VisualizationLoader";

interface CustomVisualizationProps {
	config: DashboardItem;
	loading: boolean;
	data: Record<string, any>;
}

export default function CustomVisualizationContainer({
	config,
	loading,
	data,
}: CustomVisualizationProps): React.ReactElement {
	const isItemSingleValue = config.options?.renderAs === "singleValue";
	return (
		<div style={{ padding: 16 }}>
			{/* Chart header */}
			{config.options?.title && (
				<div
					className="w-100 center align-center"
					style={{
						fontWeight: "bold",
						fontSize: isItemSingleValue ? 24 : 16,
						display: isItemSingleValue ? "block" : "flex",
					}}
				>
					{config.options?.title}
				</div>
			)}

			{/* Chart loader */}
			{loading && (
				<div>
					<DashboardLoader />
				</div>
			)}

			{/* Chart body */}
		</div>
	);
}
