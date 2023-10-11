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
		adherenceFrequency?: string;
		phoneNumber?: string;
		deviceIMEInumber?: string;
	};
}

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

export const programMapping: programMapping = {};

export const DEFAULT_SETTINGS = {
	settings: {},
	TBAdherence,
	programMapping,
	deviceEmeiList,
} as const;

export const IN_APP_SETTINGS = {};

export type DSSettings = keyof typeof DEFAULT_SETTINGS;
