import React from "react";
import { forIn } from "lodash";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import i18n from "@dhis2/d2-i18n";
import {
	SingleValueContainer,
	SingleValueContainerProps,
} from "@hisptz/dhis2-analytics";
import { DashboardItem } from "../../../../../../../shared/interfaces";
import {
	DEVICE_USAGE_DASHBOARD_ITEM_ID,
	DAT_ENROLLMENT_DASHBOARD_ITEM_ID,
} from "../../../../../../constants";
import {
	colorSets,
	COLOR_SET_DEFAULT,
} from "../../../D2VisualizationContainer/constants";

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

	if (config.options?.renderAs !== "pie") {
		return getDefaultMessageForNonExistingVisualization();
	}

	const series: any[] = [];

	forIn(enrollmentBySex ?? {}, (value, key) => {
		series.push({ name: key, y: value });
	});

	const options = {
		chart: {
			type: config.options?.renderAs ?? "",
		},
		title: {
			text: "",
		},
		credits: {
			enabled: false,
		},
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: "pointer",
				colors: colorSets[COLOR_SET_DEFAULT]?.colors ?? [],
			},
		},
		series: [{ name: i18n.t("Enrolled Patients"), data: series }],
	};

	return (
		<div>
			<HighchartsReact highcharts={Highcharts} options={options} />
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
		default:
			return getDefaultMessageForNonExistingVisualization();
	}
}
