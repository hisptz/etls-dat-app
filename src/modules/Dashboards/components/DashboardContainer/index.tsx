import React from "react";
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

const customEnrollmentDashboardItems = [
	DEVICE_USAGE_DASHBOARD_ITEM_ID,
	DAT_ENROLLMENT_DASHBOARD_ITEM_ID,
];

export default function DashboardContainer(): React.ReactElement {
	const {
		loadingEnrollemntStatus,
		loadingAdherenceSummary,
		enrollemntStatusError,
		adherenceSummaryError,
		enrollmentSummary,
		adherenceSummary,
	} = useDefaultDashboardData();

	const getCustomDashboardItemLoading = (config: DashboardItem): boolean => {
		const { id } = config;
		return customEnrollmentDashboardItems.includes(id)
			? loadingEnrollemntStatus
			: loadingAdherenceSummary;
	};

	const getCustomDashboardItemData = (
		config: DashboardItem,
	): Record<string, any> => {
		const { id } = config;
		return customEnrollmentDashboardItems.includes(id)
			? enrollmentSummary ?? {}
			: adherenceSummary ?? {};
	};
	const [dashboardConfigurations] = useSetting("dashboards", {
		global: true,
	});
	const { show: showAlert } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	if (!dashboardConfigurations || dashboardConfigurations.length == 0) {
		return (
			<div
				className="w-100 center align-center"
				style={{ display: "flex" }}
			>
				{i18n.t("There are no dashboard configurations found!")}
			</div>
		);
	}

	if (enrollemntStatusError || adherenceSummaryError) {
		const errorMessage = enrollemntStatusError
			? enrollemntStatusError.toString()
			: adherenceSummaryError.toString();
		showAlert({ message: errorMessage, type: { critical: true } });
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
			{(dashboardConfigurations as DashboardItem[]).map(
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
										loading={getCustomDashboardItemLoading(
											dashboardConfiguration,
										)}
										data={getCustomDashboardItemData(
											dashboardConfiguration,
										)}
									/>
								) : dashboardConfiguration.type ===
								  "visualization" ? (
									<D2VisualizationContainer
										{...dashboardConfiguration}
									/>
								) : (
									<p>Not found</p>
								)}
							</Card>
						</Box>
					</div>
				),
			)}
		</div>
	);
}
