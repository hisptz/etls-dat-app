import React, { ReactElement } from "react";
import { CardLoader } from "../../../../../shared/components/Loaders";

export default function DashboardLoader(): ReactElement {
	return (
		<div
			className="flex center align-center"
			style={{ width: "100%", minHeight: "15vh" }}
		>
			<div>
				<CardLoader />
			</div>
		</div>
	);
}
