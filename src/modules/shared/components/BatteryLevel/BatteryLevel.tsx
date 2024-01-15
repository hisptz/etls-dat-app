import React from "react";
import { useDeviceData } from "../ProfileArea/utils";
import { CircularLoader } from "@dhis2/ui";

export interface BatteryLevelProps {
	device?: string;
	batteryLevel?: number;
}

function BatteryLevel({ device, batteryLevel }: BatteryLevelProps) {
	const { data, loadingDevice } = useDeviceData(device);

	// TODO update this to the millivolts mapping

	let color;
	const battery = batteryLevel ?? data?.batteryLevel ?? 0;

	if (battery >= 60) {
		color = "#4caf50";
	} else if (battery >= 25) {
		color = "#f5d631";
	} else {
		color = "#d32f2f";
	}

	const batteryStyles = {
		width: "37px",
		height: "19.5px",
		border: `1px solid ${color}`,
		padding: "2px",
		position: "relative",
		borderRadius: "3.5px",
	};

	const levelStyles = {
		height: "100%",
		width: battery <= 100 ? `${battery}%` : "100%",
		backgroundColor: color,
		borderRadius: "1.5px",
	};

	const knobStyles = {
		width: "2.4px",
		height: "7px",
		background: color,
		position: "absolute",
		left: "37px",
		top: "5px",
		borderRadius: "0px 20px 20px 0px",
	};

	return device != "N/A" ? (
		loadingDevice && !batteryLevel ? (
			<CircularLoader small />
		) : (
			<div style={batteryStyles}>
				<div style={levelStyles}></div>
				<div style={knobStyles}></div>
			</div>
		)
	) : null;
}

export default BatteryLevel;
