import React from "react";
import { IconWarningFilled24 } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";

interface NoDeviceAssigned {
	message: string;
}

function NoDeviceAssigned({ message }: NoDeviceAssigned) {
	return (
		<div
			style={{
				width: "25vw",
				height: "10vh",
				backgroundColor: "#fff8e1",
				border: "2px solid #ffe491",
				padding: "16px",
				display: "flex",
				alignItems: "start",
			}}
		>
			<div>
				<IconWarningFilled24 color="#e56408" />
			</div>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "start",
					paddingLeft: "20px",
				}}
			>
				<span style={{ marginBottom: "16px" }}>
					{i18n.t("Missing Dose Data")}
				</span>
				<span>{i18n.t(message)}</span>
			</div>
		</div>
	);
}

export default NoDeviceAssigned;
