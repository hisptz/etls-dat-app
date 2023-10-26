import React from "react";
import { ROUTES } from "../../../Routes/constants/nav";
import { Menu, MenuItem } from "@dhis2/ui";
import classes from "./SideNav.module.css";
import classNames from "classnames";
import { useMatches, useNavigate } from "react-router-dom";
import { DATA_TEST_PREFIX } from "../../../shared/constants";

export function SideNav() {
	const matches = useMatches();
	const navigate = useNavigate();

	return (
		<aside
			className={classes.aside}
			style={{
				maxWidth: 300,
				minWidth: 200,
				width: "30vw",
			}}
		>
			<Menu>
				{ROUTES.map(({ label, path, id, icon }) => {
					const Icon = icon as React.JSXElementConstructor<any>;
					return (
						<MenuItem
							dataTest={`${DATA_TEST_PREFIX}-${path}-menu-item`}
							onClick={() => {
								navigate(`${path}`);
							}}
							icon={<Icon />}
							label={label}
							value={path}
							className={classNames(classes["menu-item"], {
								[classes.selected]: matches.some((match) =>
									match.pathname.match(path),
								),
							})}
							key={`${id}-side-menu-item`}
						/>
					);
				})}
			</Menu>
		</aside>
	);
}
