import React, { ReactNode } from "react";
import { IconWarningFilled24 } from "@dhis2/ui";

interface NoDeviceAssigned {
	message: ReactNode;
	title: string;
}

function NoDeviceAssigned({ message, title }: NoDeviceAssigned) {
	return (
		<div
			style={{
				width: "25vw",
				height: "12vh",
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
				<span
					style={{
						marginBottom: "16px",
						fontWeight: "500",
						fontSize: "18px",
					}}
				>
					{title}
				</span>
				{message}
			</div>
		</div>
	);
}

export default NoDeviceAssigned;
