import { Tag } from "@dhis2/ui";
import React, { useMemo } from "react";

export interface StatusBadgeProps {
	status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
	return (
		<Tag>
			<b>{status}</b>
		</Tag>
	);
}
