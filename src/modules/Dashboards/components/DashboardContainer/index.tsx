import React from "react";
import { Box, Card } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { useDefaultDashboardData } from "../../hooks/data";
import { useSetting } from "@dhis2/app-service-datastore";
import { useAlert } from "@dhis2/app-runtime";
import { DashboardItem } from "../../../shared/interfaces";

export default function DashboardContainer(): React.ReactElement {
	const {
		loadingEnrollemntStatus,
		loadingAdherenceSummary,
		enrollemntStatusError,
		adherenceSummaryError,
		enrollmentSummary,
		adherenceSummary,
	} = useDefaultDashboardData();
	console.log({ enrollmentSummary, adherenceSummary });
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
								<div style={{ padding: 8 }}>
									<p>
										{dashboardConfiguration.options?.title}
									</p>
								</div>
							</Card>
						</Box>
					</div>
				),
			)}
		</div>
	);
}
