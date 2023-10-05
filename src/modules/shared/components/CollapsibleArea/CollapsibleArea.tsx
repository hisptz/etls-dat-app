import React from "react";
import Collapsible from "react-collapsible";
import { useBoolean } from "usehooks-ts";
import { Button, Divider, IconChevronDown24, IconChevronUp24 } from "@dhis2/ui";

export interface CollapsibleAreaProps {
	header: string;
	children: React.ReactElement;
	defaultOpen?: boolean;
}

export function CollapsibleArea({
	header,
	children,
	defaultOpen,
}: CollapsibleAreaProps) {
	const {
		value: open,
		setTrue: onOpen,
		setFalse: onClose,
		toggle,
	} = useBoolean(defaultOpen);

	return (
		<Collapsible
			triggerDisabled
			onOpen={onOpen}
			onClose={onClose}
			open={open}
			trigger={
				<div className="column">
					<div className="row space-between gap-16">
						<h3 className="m-0">{header}</h3>
						<Button
							onClick={toggle}
							small
							icon={
								open ? (
									<IconChevronUp24 />
								) : (
									<IconChevronDown24 />
								)
							}
						/>
					</div>
					<Divider />
				</div>
			}
		>
			{children}
		</Collapsible>
	);
}
