import React from "react";
import { filter } from "lodash";
import { Box, Card } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { useDefaultDashboardData } from "../../hooks/data";
import { useSetting } from "@dhis2/app-service-datastore";
import { useAlert } from "@dhis2/app-runtime";
import { DashboardItem } from "../../../shared/interfaces";
import CustomVisualizationContainer from "./components/CustomVisualizationContainer";
import D2VisualizationContainer from "./components/D2VisualizationContainer";
import {
	DEVICE_USAGE_DASHBOARD_ITEM_ID,
	DAT_ENROLLMENT_DASHBOARD_ITEM_ID,
} from "../../constants";
import { useSearchParams } from "react-router-dom";

const customEnrollmentDashboardItems = [
	DEVICE_USAGE_DASHBOARD_ITEM_ID,
	DAT_ENROLLMENT_DASHBOARD_ITEM_ID,
];

export default function DashboardContainer(): React.ReactElement {
	const {
		loadingEnrollemntStatus,
		enrollemntStatusError,
		enrollmentSummary,
	} = useDefaultDashboardData();
	const [selectedPrograms] = useSearchParams();
	const selectedProgramId = selectedPrograms.get("program");

	const [dashboardConfigurations] = useSetting("dashboards", {
		global: true,
	});
	const { show: showAlert } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	const sanitizedDashboardConfigurations = filter(
		dashboardConfigurations,
		(dashboardConfiguration: DashboardItem) => {
			return (
				!dashboardConfiguration.program ||
				dashboardConfiguration.program == selectedProgramId
			);
		},
	);

	if (
		!sanitizedDashboardConfigurations ||
		sanitizedDashboardConfigurations.length == 0
	) {
		return (
			<div
				className="w-100 center align-center"
				style={{ display: "flex" }}
			>
				{i18n.t("There are no dashboard configurations found!")}
			</div>
		);
	}

	if (enrollemntStatusError) {
		showAlert({ message: enrollemntStatusError, type: { critical: true } });
	}

	return (
		<div
			style={{
				display: "grid",
				width: "100%",
				gap: 8,
				gridTemplateColumns: "1fr 1fr 1fr 1fr",
			}}
		>
			{(sanitizedDashboardConfigurations as DashboardItem[]).map(
				(dashboardConfiguration: DashboardItem) => (
					<div
						key={`${dashboardConfiguration.id}-visualization-container`}
						style={{
							gridColumn: `auto / span ${dashboardConfiguration.span}`,
						}}
					>
						<Box height="100%" width="100%">
							<Card>
								{dashboardConfiguration.type == "custom" ? (
									<CustomVisualizationContainer
										config={dashboardConfiguration}
										loading={loadingEnrollemntStatus}
										data={enrollmentSummary ?? {}}
									/>
								) : "visualization" ? (
									<D2VisualizationContainer
										{...dashboardConfiguration}
									/>
								) : (
									// TODO Add handler for d2 visualizations
									<p style={{ textAlign: "center" }}>
										Visualization of type{" "}
										{dashboardConfiguration.type} is not
										Supported!
									</p>
								)}
							</Card>
						</Box>
					</div>
				),
			)}
		</div>
	);
}
