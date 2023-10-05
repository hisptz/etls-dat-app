export interface TBAdherenceConfig {
	key: string;
	label: string;
	path: string | Array<string | number>;
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

export const DEFAULT_SETTINGS = {
	settings: {},
	TBAdherence,
} as const;

export const IN_APP_SETTINGS = {};

export type DSSettings = keyof typeof DEFAULT_SETTINGS;
