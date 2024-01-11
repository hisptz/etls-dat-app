import React from "react";
import {
	DATClientOverview,
	DATClientOverviewOutlet,
} from "../../DATClientOverview";
import { Reports, ReportsOutlet } from "../../Reports";

import {
	IconDashboardWindow24,
	IconTable24,
	IconSettings24,
	IconVisualizationLinelist24,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";

import { Navigate } from "react-router-dom";

import { DATClientDetails } from "../../DATClientOverview/DATClientDetails/DATClientDetails";

import { Configuration } from "../../Configuration";
import { Dashboards } from "../../Dashboards";
import { ProgramMapping } from "../../Configuration/components/ProgramMapping";
import { DATDevicelists } from "../../Configuration/components/DATDeviceLists";
import { RegimenSetUp } from "../../Configuration/components/RegimeSetUp";
import { getDefaultDATOverviewFilters } from "../../DATClientOverview/constants/filters";
import { getDefaultReportFilters } from "../../Reports/constants/filters";
import AdherenceIcon from "../components/AdherenceIcon";
import { DATAssignment, DATAssignmentOutlet } from "../../DATAssignment";
import { DATAssignmentDetails } from "../../DATAssignment/DATAssignmentDetails/DATAssignmentDetails";

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
		id: "dat-client-overview",
		path: "dat-client-overview",
		element: DATClientOverviewOutlet,
		icon: AdherenceIcon,
		label: i18n.t("DAT Client Overview"),
		subItems: [
			{
				path: "",
				id: "dat-client-overview-redirect",
				element: () => {
					const defaultParams = getDefaultDATOverviewFilters();
					return <Navigate to={`list?${defaultParams.toString()}`} />;
				},
			},
			{
				path: "list",
				id: "dat-client-overview-list",
				element: DATClientOverview,
			},
			{
				path: ":id",
				id: "dat-client-overview-details",
				element: DATClientDetails,
			},
		],
	},
	{
		id: "dat-assignment",
		path: "dat-assignment",
		element: DATAssignmentOutlet,
		icon: AdherenceIcon,
		label: i18n.t("DAT Assignment"),
		subItems: [
			{
				path: "",
				id: "dat-assignment-redirect",
				element: () => {
					const defaultParams = getDefaultDATOverviewFilters();
					return <Navigate to={`list?${defaultParams.toString()}`} />;
				},
			},
			{
				path: "list",
				id: "dat-assignment-list",
				element: DATAssignment,
			},
			{
				path: ":id",
				id: "dat-assignment-details",
				element: DATAssignmentDetails,
			},
		],
	},
	{
		id: "dashboards",
		path: "dashboards",
		element: Dashboards,
		icon: IconDashboardWindow24,
		label: i18n.t("Dashboards"),
	},
	{
		id: "reports",
		path: "reports",
		element: ReportsOutlet,
		icon: IconVisualizationLinelist24,
		label: i18n.t("Reports"),
		subItems: [
			{
				path: "",
				id: "reports-redirect",
				element: () => {
					const defaultParams = getDefaultReportFilters();
					return <Navigate to={`list?${defaultParams.toString()}`} />;
				},
			},
			{
				path: "list",
				id: "reports-list",
				element: Reports,
			},
		],
	},

	{
		id: "configuration",
		path: "configuration",
		label: i18n.t("Configuration"),
		icon: IconSettings24,
		element: Configuration,
		subItems: [
			{
				path: "",
				id: "settings-main",
				element: () => {
					return <Navigate to="program-mapping" />;
				},
			},
			{
				path: "program-mapping",
				id: "program-mapping",
				label: i18n.t("Program Mapping"),
				element: ProgramMapping,
			},

			{
				path: "dat-device-lists",
				id: "dat-device-lists",
				label: i18n.t("DAT Device lists"),
				element: DATDevicelists,
			},
			{
				path: "regimen-setup",
				id: "regimen-setup",
				label: i18n.t("Regimen Settings"),
				element: RegimenSetUp,
			},
		],
	},
];
