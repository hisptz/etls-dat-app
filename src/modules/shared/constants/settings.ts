import {
	DAT_ENROLLMENT_DASHBOARD_ITEM_ID,
	DEVICE_USAGE_DASHBOARD_ITEM_ID,
} from "../../Dashboards/constants";
import { DashboardItem } from "../interfaces";

export interface DAT_TableConfig {
	key: string;
	label: string;
	path: string | Array<string | number>;
	sortable?: boolean;
}
export interface DeviceIMEIList {
	IMEI: string;
	inUse: boolean;
	name: string;
	code: string;
}

export interface RegimenSetting {
	regimen: string;
	administration: string;
	numberOfDoses: string;
}
export interface ProgramMapping {
	name?: string;
	program?: string;
	programStage?: string;
	mediatorUrl?: string;
	apiKey?: string;
	attributes?: {
		firstName?: string;
		surname?: string;
		patientNumber?: string;
		age?: string;
		sex?: string;
		regimen?: string;
		phoneNumber?: string;
		deviceIMEInumber?: string;
		episodeId?: string;
	};
}

export interface ReportColumn {
	key: string;
	label: string;
	path: string | Array<string | number>;
}

export interface ReportConfig {
	name: string;
	id: string;
	filters: string[];
	columns: Array<ReportColumn>;
}

export const reports: ReportConfig[] = [
	{
		name: "TB Adherence Report",
		id: "tb-adherence-report",
		filters: ["ou", "pe"],
		columns: [
			{
				key: "treatmentStart",
				label: "Treatment Start Date",
				path: "treatmentStart",
			},
			{
				key: "patientNumber",
				label: "Patient Number",
				path: "patientNumber",
			},
			{
				key: "name",
				label: "Name",
				path: "name",
			},
			{
				key: "orgUnit",
				label: "Organization Unit",
				path: "orgUnit",
			},
			{
				key: "deviceIMEI",
				label: "Device IMEI",
				path: "deviceIMEI",
			},
			{
				key: "battery",
				label: "Battery",
				path: "battery",
			},
			{
				key: "adherenceFrequency",
				label: "Adherence Frequency",
				path: "adherenceFrequency",
			},

			{
				key: "adherencePercentage",
				label: "Overall Adherence (%)",
				path: "adherencePercentage",
			},
			{
				key: "adherenceStreak",
				label: "Adherence Streak",
				path: "adherenceStreak",
			},
		],
	},
	{
		name: "DAT Device Summary Report",
		id: "dat-device-summary-report",
		filters: [],
		columns: [
			{
				key: "deviceIMEINumber",
				label: "Device IMEI",
				path: "deviceIMEINumber",
			},
			{
				key: "daysInUse",
				label: "Number of Days in Use",
				path: "name",
			},
			{
				key: "lastHeartbeat",
				label: "Last Heartbeat",
				path: "lastHeartbeat",
			},
			{
				key: "lastOpened",
				label: "Last Opened",
				path: "lastOpened",
			},
			{
				key: "lastBatteryLevel",
				label: "Last Battery Level",
				path: "lastBatteryLevel",
			},
		],
	},
	{
		name: "Patients Who Missed Doses",
		id: "patients-who-missed-doses",
		filters: ["ou", "pe"],
		columns: [
			{
				key: "patientNumber",
				label: "Patient Number",
				path: "patientNumber",
			},
			{
				key: "name",
				label: "Name",
				path: "name",
			},
			{
				key: "phoneNumber",
				label: "Phone Number",
				path: "phoneNumber",
			},
			{
				key: "adherenceFrequency",
				label: "Adherence Frequency",
				path: "adherenceFrequency",
			},
			{
				key: "numberOfMissedDoses",
				label: "Number of Missed Doses",
				path: "numberOfMissedDoses",
			},
		],
	},
];

export const DATClientOverview: DAT_TableConfig[] = [
	{
		key: "treatmentStart",
		label: "Treatment Start",
		path: "treatmentStart",
		sortable: false,
	},
	{
		key: "patientNumber",
		label: "Patient Number",
		path: "patientNumber",
		sortable: false,
	},
	{
		key: "name",
		label: "Name",
		path: "name",
		sortable: false,
	},

	{
		key: "orgUnit",
		label: "Organisation Unit",
		path: "orgUnit",
	},
	{
		key: "battery",
		label: "Battery",
		path: "battery",
	},

	{
		key: "deviceIMEINumber",
		label: "Device IMEI",
		path: "deviceIMEINumber",
		sortable: false,
	},

	{
		key: "adherenceFrequency",
		label: "Adherence Frequency",
		path: "adherenceFrequency",
	},

	{
		key: "overallAdherence",
		label: "Overall Adherence (%)",
		path: "overallAdherence",
	},
	{
		key: "adherenceStreak",
		label: "Adherence Streak",
		path: "adherenceStreak",
	},
];

export const DATAssignment: DAT_TableConfig[] = [
	{
		key: "treatmentStart",
		label: "Treatment Start",
		path: "treatmentStart",
		sortable: true,
	},
	{
		key: "patientNumber",
		label: "Patient Number",
		path: "patientNumber",
		sortable: true,
	},
	{
		key: "name",
		label: "Name",
		path: "name",
		sortable: true,
	},

	{
		key: "orgUnit",
		label: "Organisation Unit",
		path: "orgUnit",
	},
];

export const dashboards: DashboardItem[] = [
	{
		id: DEVICE_USAGE_DASHBOARD_ITEM_ID,
		span: 4,
		type: "custom",
		options: {
			renderAs: "singleValue",
			title: "Devices Usage Summary",
		},
	},
	{
		id: DAT_ENROLLMENT_DASHBOARD_ITEM_ID,
		span: 4,
		type: "custom",
		options: {
			renderAs: "pie",
			title: "Patients Enrolled into DAT",
		},
	},
];

export const deviceIMEIList: DeviceIMEIList[] = [];

export const regimenSetting: RegimenSetting[] = [];

export const programMapping: ProgramMapping[] = [];

export const DEFAULT_SETTINGS = {
	settings: {},
	DATClientOverview,
	DATAssignment,
	programMapping,
	deviceIMEIList,
	regimenSetting,
	reports,
	dashboards,
} as const;

export const IN_APP_SETTINGS = {};

export type DSSettings = keyof typeof DEFAULT_SETTINGS;
