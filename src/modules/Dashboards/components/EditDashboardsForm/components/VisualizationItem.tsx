import React from "react";
import { useDataQuery } from "@dhis2/app-runtime";
import { IconDelete24, IconDashboardWindow24, CircularLoader } from "@dhis2/ui";
const VisualizationQuery = {
	d2Visualizations: {
		resource: "visualizations",
		id: ({ id }: any) => id,
		params: {
			fields: ["id", "displayName"],
			page: 1,
			pageSize: 50,
		},
	},
};

type VisualizationItemProps = {
	id: string;
	onDelete: (id: string) => void;
};

export default function VisualizationItem({
	id,
	onDelete,
}: VisualizationItemProps): React.ReactElement {
	const { data, loading, error } = useDataQuery(VisualizationQuery, {
		variables: {
			id,
		},
	});

	if (error) {
		return <p>Error: {error.message}</p>;
	}

	return (
		<div>
			<div
				style={{
					display: "flex",
					gap: "16px",
					alignItems: "center",
					justifyContent: "start",
				}}
			>
				<span>
					<IconDashboardWindow24 />
				</span>
				<span style={{ flex: 1 }}>
					{loading ? (
						<CircularLoader extrasmall />
					) : (
						(data?.d2Visualizations as any)?.displayName
					)}{" "}
				</span>
				<span onClick={() => onDelete(id)}>
					<IconDelete24 color="red" />
				</span>
			</div>
		</div>
	);
}
