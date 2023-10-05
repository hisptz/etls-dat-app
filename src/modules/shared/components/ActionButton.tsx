import React from "react";
import { IconDelete24, IconEdit24, IconView24, MenuItem } from "@dhis2/ui";
import { compact } from "lodash";
import i18n from "@dhis2/d2-i18n";

export interface ActionButtonProps {
	onEdit?: () => void;
	onDelete?: () => void;
	onView?: () => void;
	customActions?: Array<{
		label: string;
		icon: React.ReactNode;
		onClick: () => void;
	}>;
	dataTest?: string;

	[key: string]: any;
}

export function ActionButton({
	onEdit,
	onDelete,
	onView,
	customActions,
	dataTest,
	...props
}: ActionButtonProps) {
	const [ref, setRef] = React.useState<HTMLButtonElement | null>(null);

	const menu = compact([
		onView
			? {
					label: i18n.t("View"),
					onClick: onView,
					icon: <IconView24 />,
			  }
			: undefined,
		onDelete
			? {
					label: i18n.t("Delete"),
					onClick: onDelete,
					icon: <IconDelete24 color={"red"} />,
			  }
			: undefined,
		onEdit
			? {
					label: i18n.t("Edit"),
					onClick: onEdit,
					icon: <IconEdit24 />,
			  }
			: undefined,

		...(customActions ?? []),
	]);

	return (
		<div style={{ display: "flex", flexDirection: "row", width: "30px" }}>
			{menu.map(({ label, onClick, icon }) => (
				<MenuItem
					dataTest={`${dataTest}-${label}`}
					icon={icon}
					key={`${label}-menu-item`}
					onClick={() => {
						onClick();
					}}
				/>
			))}
		</div>
	);
}
