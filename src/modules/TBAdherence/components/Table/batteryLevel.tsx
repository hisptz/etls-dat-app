import React from "react";
import { useDeviceData } from "../../../shared/components/ProfileArea/utils";
import { CircularLoader } from "@dhis2/ui";

export interface BatteryLevelProps {
	device?: string;
	batteryLevel?: number;
}

function BatteryLevel({ device, batteryLevel }: BatteryLevelProps) {
	const { data, loadingDevice } = useDeviceData(device);

	let color;
	const battery = batteryLevel ?? data?.batteryLevel ?? 0;
	if (battery >= 75) {
		color = "green";
	} else if (battery >= 50) {
		color = "#70ad47";
	} else if (battery >= 25) {
		color = "orange";
	} else {
		color = "red";
	}

	const batteryStyles = {
		width: "35px",
		height: "20px",
		border: `2px solid ${color}`,
		padding: "1px",
		position: "relative",
		borderRadius: "3px",
	};

	const levelStyles = {
		height: "100%",
		width: battery <= 100 ? `${battery}%` : "100%",
		backgroundColor: color,
		borderRadius: "1px",
	};

	const knobStyles = {
		width: "5px",
		height: "9px",
		background: color,
		position: "absolute",
		left: "32px",
		top: "4px",
		borderRadius: "2px",
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
