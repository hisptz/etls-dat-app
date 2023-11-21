import React from "react";
import i18n from "@dhis2/d2-i18n";
import {
	SingleValueContainer,
	SingleValueContainerProps,
	CircularProgressDashboard,
} from "@hisptz/dhis2-analytics";
import { DashboardItem } from "../../../../../../../shared/interfaces";
import {
	DEVICE_USAGE_DASHBOARD_ITEM_ID,
	DAT_ENROLLMENT_DASHBOARD_ITEM_ID,
	ADHERENCE_PERCENTAGE_DASHBOARD_ITEM_ID,
} from "../../../../../../constants";

interface CustomVisualizationBodyProps {
	data: Record<string, any>;
	config: DashboardItem;
}

function getDefaultMessageForNonExistingVisualization() {
	return (
		<div className="w-100 center align-center" style={{ display: "flex" }}>
			{i18n.t("Configured visualization does not exist")}
		</div>
	);
}

function getDeviceUsageDashboard({
	data,
	config,
}: CustomVisualizationBodyProps) {
	const { numberOfClients, numberOfDevices, clientsRegisteredIntoDAT } = data;
	const visualizationType = config.options?.renderAs;

	if (visualizationType === "singleValue") {
		const items: SingleValueContainerProps = {
			singleValueItems: [
				{
					label: i18n.t("Total number of clients"),
					value: numberOfClients ?? 0,
				},
				{
					label: i18n.t("Total number of devices"),
					value: numberOfDevices,
				},
				{
					label: i18n.t("Clients registered with devices"),
					value: clientsRegisteredIntoDAT,
					percentage:
						(clientsRegisteredIntoDAT / numberOfDevices) * 100,
				},
			],
			title: "",
		};
		return <SingleValueContainer {...items} />;
	} else {
		return getDefaultMessageForNonExistingVisualization();
	}
}

function getEnrollmentSummaryByGender({
	data,
	config,
}: CustomVisualizationBodyProps): React.ReactElement {
	const { enrollmentBySex } = data;
	console.log({ enrollmentBySex });

	if (config.options?.renderAs !== "pie") {
		return getDefaultMessageForNonExistingVisualization();
	}

	return <></>;
}

function getAdherencePercentageSummary({
	data,
	config,
}: CustomVisualizationBodyProps): React.ReactElement {
	const { totalDeviceSignalEvents, deviceSignalsForDoseTake } = data;
	if (config.options?.renderAs !== "progress") {
		return getDefaultMessageForNonExistingVisualization();
	}
	return (
		<div>
			<div className="pv-8 center align-center flex">
				<CircularProgressDashboard
					denominator={
						deviceSignalsForDoseTake / totalDeviceSignalEvents
					}
					numerator={1}
					size={100}
				/>
			</div>

			<div className="center align-center flex">
				{i18n.t("Number of reported devices:")}&nbsp;&nbsp;
				<span style={{ fontWeight: "bold" }}>
					{totalDeviceSignalEvents}
				</span>
			</div>
		</div>
	);
}

export default function CustomVisualizationBody({
	data,
	config,
}: CustomVisualizationBodyProps): React.ReactElement {
	const { id } = config;
	switch (id) {
		case DEVICE_USAGE_DASHBOARD_ITEM_ID:
			return getDeviceUsageDashboard({ data, config });
		case DAT_ENROLLMENT_DASHBOARD_ITEM_ID:
			return getEnrollmentSummaryByGender({ data, config });
		case ADHERENCE_PERCENTAGE_DASHBOARD_ITEM_ID:
			return getAdherencePercentageSummary({ data, config });
		default:
			return getDefaultMessageForNonExistingVisualization();
	}
}
