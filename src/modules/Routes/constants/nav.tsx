import React from "react";
import { TBAdherenceOutlet, TBAdherencePage } from "../../TBAdherence";
import { Reports } from "../../Reports";

import {
	IconDashboardWindow24,
	IconSettings24,
	IconVisualizationColumn24,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";

import { Navigate } from "react-router-dom";

import { getDefaultTBAdherenceFilters } from "../../TBAdherence/constants/filters";

import { Configuration } from "../../Configuration";
import { TBAdherenceDetails } from "../../TBAdherence/TBAdherenceDetails/TBAdherenceDetails";

export interface NavItem {
	label?: string | ((data: any) => any);
	id: string;
	path: string;
	icon?: React.JSXElementConstructor<any>;
	element?: React.JSXElementConstructor<any>;
	subItems?: NavItem[];
}

export const ROUTES: NavItem[] = [
	{
		id: "tbadherence",
		path: "tbadherence",
		element: TBAdherenceOutlet,
		icon: IconVisualizationColumn24,
		label: i18n.t("TB Adherence"),
		subItems: [
			{
				path: "",
				id: "tbadherence-redirect",
				element: () => {
					const defaultParams = getDefaultTBAdherenceFilters();
					return <Navigate to={`list?${defaultParams.toString()}`} />;
				},
			},
			{
				path: "list",
				id: "tbadherence-list",
				element: TBAdherencePage,
			},
			{
				path: ":id",
				id: "tbadherence-details",
				element: TBAdherenceDetails,
			},
		],
	},
	{
		id: "reports",
		path: "reports",
		element: Reports,
		icon: IconDashboardWindow24,
		label: i18n.t("Reports"),
	},
	{
		id: "configuration",
		path: "configuration",
		element: Configuration,
		icon: IconSettings24,
		label: i18n.t("Configuration"),
	},
];
