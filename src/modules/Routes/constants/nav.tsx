import React from "react";
import { TBAdherencePage, TreatmentAdherenceOutlet } from "../../TBAdherence";
import { Reports } from "../../Reports";

import {
	IconDashboardWindow24,
	IconTable24,
	IconSettings24,
	IconVisualizationLinelist24,
	IconVisualizationColumn24,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";

import { Navigate } from "react-router-dom";

import { TBAdherenceDetails } from "../../TBAdherence/TBAdherenceDetails/TBAdherenceDetails";

import { Configuration } from "../../Configuration";
import { Dashboards } from "../../Dashboards";
import { ProgramMapping } from "../../Configuration/components/ProgramMapping";
import { DATDevicelists } from "../../Configuration/components/DATDeviceLists";
import { RegimenSetUp } from "../../Configuration/components/RegimeSetUp";
import { getDefaultTBAdherenceFilters } from "../../TBAdherence/constants/filters";

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
		id: "treatment-adherence",
		path: "treatment-adherence",
		element: TreatmentAdherenceOutlet,
		icon: IconTable24,
		label: i18n.t("Treatment Adherence"),
		subItems: [
			{
				path: "",
				id: "treatment-adherence-redirect",
				element: () => {
					const defaultParams = getDefaultTBAdherenceFilters();
					return <Navigate to={`list?${defaultParams.toString()}`} />;
				},
			},
			{
				path: "list",
				id: "treatment-adherence-list",
				element: TBAdherencePage,
			},
			{
				path: ":id",
				id: "treatment-adherence-details",
				element: TBAdherenceDetails,
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
		element: Reports,
		icon: IconVisualizationLinelist24,
		label: i18n.t("Reports"),
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
