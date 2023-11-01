export interface TBAdherenceConfig {
	key: string;
	label: string;
	path: string | Array<string | number>;
}
export interface deviceEmeiList {
	emei: string;
	inUse: boolean;
	name: string;
	code: string;
}

export interface regimenSetting {
	regimen: string;
	administration: string;
	idealDoses: string;
	idealDuration: string;
	completionMinimumDoses: string;
	completionMaximumDuration: string;
}
export interface programMapping {
	program?: string;
	programStage?: string;
	mediatorUrl?: string;
	apiKey?: string;
	attributes?: {
		firstName?: string;
		surname?: string;
		tbDistrictNumber?: string;
		age?: string;
		sex?: string;
		regimen?: string;
		phoneNumber?: string;
		deviceIMEInumber?: string;
	};
}
export interface ReportConfig {
	name: string;
	id: string;
	columns: Array<{
		key: string;
		label: string;
		path: string | Array<string | number>;
	}>;
}

export const reports: ReportConfig[] = [
	{
		name: "TB Adherence Report",
		id: "tb-adherence-report",
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
		key: "tbDistrictNumber",
		label: "TB District Number",
		path: "tbDistrictNumber",
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

export const deviceEmeiList: deviceEmeiList[] = [];

export const regimenSetting: regimenSetting[] = [];

export const programMapping: programMapping = {};

export const DEFAULT_SETTINGS = {
	settings: {},
	TBAdherence,
	programMapping,
	deviceEmeiList,
	regimenSetting,
	reports,
} as const;

export const IN_APP_SETTINGS = {};

export type DSSettings = keyof typeof DEFAULT_SETTINGS;
