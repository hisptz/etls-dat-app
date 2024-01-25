import React from "react";
import { useDeviceData } from "../ProfileArea/utils";
import { CircularLoader, Tooltip } from "@dhis2/ui";

export interface BatteryLevelProps {
	device?: string;
	batteryLevel?: number;
}

function getSanitizedBatteryLevel(batteryLevel: number): number {
	return batteryLevel >= 3750 ? 100 : batteryLevel >= 2650 ? 50 : 5;
}

function BatteryLevel({ device, batteryLevel }: BatteryLevelProps) {
	const { data, loadingDevice } = device
		? useDeviceData(device)
		: { data: null, loadingDevice: false };

	let color;
	const battery = getSanitizedBatteryLevel(
		batteryLevel ?? data?.batteryLevel ?? 0,
	);

	const stringifiedBattery = `${batteryLevel ?? data?.batteryLevel ?? 0} mV`;

	if (battery >= 60) {
		color = "#4caf50";
	} else if (battery >= 25) {
		color = "#f5d631";
	} else {
		color = "#d32f2f";
	}

	const batteryStyles: Record<string, string> = {
		width: "37px",
		height: "19.5px",
		border: `1px solid ${color}`,
		padding: "2px",
		position: "relative",
		borderRadius: "3.5px",
	};

	const levelStyles: Record<string, string> = {
		height: "100%",
		width: battery <= 100 ? `${battery}%` : "100%",
		backgroundColor: color,
		borderRadius: "1.5px",
	};

	const knobStyles: Record<string, string> = {
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
			<Tooltip content={stringifiedBattery}>
				<div style={batteryStyles}>
					<div style={levelStyles}></div>
					<div style={knobStyles}></div>
				</div>
			</Tooltip>
		)
	) : null;
}

export default BatteryLevel;
