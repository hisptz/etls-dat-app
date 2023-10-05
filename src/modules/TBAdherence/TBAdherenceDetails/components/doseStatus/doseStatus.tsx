import React from "react";
import { Box } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";

interface DoseStatusProps {
	color: string;
	status: string;
}

function DoseStatus({ color, status }: DoseStatusProps) {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "row",
				marginRight: "10px",
				alignItems: "center",
			}}
		>
			<div
				style={{
					backgroundColor: color,
					marginRight: "10px",
					border: "1px solid #cccc",
				}}
			>
				<Box height={"40px"} width={"65px"}></Box>
			</div>
			{i18n.t(status)}
		</div>
	);
}

export default DoseStatus;
