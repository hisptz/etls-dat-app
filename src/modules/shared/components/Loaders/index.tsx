import React from "react";
import { CenteredContent, CircularLoader } from "@dhis2/ui";

export function FullPageLoader({
	minHeight,
	message,
}: {
	minHeight?: number | string;
	message?: string;
}): React.ReactElement {
	return (
		<CenteredContent>
			<CircularLoader small />
			{message != null && <p>{message}</p>}
		</CenteredContent>
	);
}

export function CardLoader() {
	return (
		<CenteredContent>
			<CircularLoader small />
		</CenteredContent>
	);
}
