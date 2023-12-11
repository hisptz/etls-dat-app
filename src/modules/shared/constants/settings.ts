import {
	ADHERENCE_PERCENTAGE_DASHBOARD_ITEM_ID,
	DAT_ENROLLMENT_DASHBOARD_ITEM_ID,
	DEVICE_USAGE_DASHBOARD_ITEM_ID,
} from "../../Dashboards/constants";
import { DashboardItem } from "../interfaces";

export interface TBAdherenceConfig {
	key: string;
	label: string;
	path: string | Array<string | number>;
}
export interface deviceIMEIList {
	IMEI: string;
	inUse: boolean;
	name: string;
	code: string;
}

export interface regimenSetting {
	regimen: string;
	administration: string;
	idealDoses: string;
}
export interface programMapping {
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
				key: "tbIdentificationNumber",
				label: "TB Identification Number",
				path: "tbIdentificationNumber",
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
				key: "adherencePercentage",
				label: "Adherence Percentage",
				path: "adherencePercentage",
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
				key: "tbIdentificationNumber",
				label: "TB Identification Number",
				path: "tbIdentificationNumber",
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

export const TBAdherence: TBAdherenceConfig[] = [
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
		key: "deviceIMEINumber",
		label: "Device IMEI Number",
		path: "deviceIMEINumber",
	},
	{
		key: "adherenceFrequency",
		label: "Adherence Frequency",
		path: "adherenceFrequency",
	},
	{
		key: "adherenceStreak",
		label: "Adherence Streak",
		path: "adherenceStreak",
	},
];

export const dashboards: DashboardItem[] = [
	{
		id: DEVICE_USAGE_DASHBOARD_ITEM_ID,
		span: 3,
		type: "custom",
		options: {
			renderAs: "singleValue",
			title: "Devices Usage Summary",
		},
	},
	{
		id: ADHERENCE_PERCENTAGE_DASHBOARD_ITEM_ID,
		span: 1,
		type: "custom",
		options: {
			renderAs: "progress",
			title: "Last 1 day Patience Adherence ",
		},
	},
	{
		id: DAT_ENROLLMENT_DASHBOARD_ITEM_ID,
		span: 2,
		type: "custom",
		options: {
			renderAs: "pie",
			title: "Patients Enrolled into DAT",
		},
	},
];

export const deviceIMEIList: deviceIMEIList[] = [];

export const regimenSetting: regimenSetting[] = [];

export const programMapping: programMapping[] = [];

export const DEFAULT_SETTINGS = {
	settings: {},
	TBAdherence,
	programMapping,
	deviceIMEIList,
	regimenSetting,
	reports,
	dashboards,
} as const;

export const IN_APP_SETTINGS = {};

export type DSSettings = keyof typeof DEFAULT_SETTINGS;
