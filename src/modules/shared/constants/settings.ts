export interface TBAdherenceConfig {
	name: string;
	id: string; //Primary-screening
	columns: Array<{
		key: string;
		label: string;
		path: string | Array<string | number>;
	}>;
}

export const reports: TBAdherenceConfig[] = [];

export const DEFAULT_SETTINGS = {
	settings: {},
} as const;

export const IN_APP_SETTINGS = {};

export type DSSettings = keyof typeof DEFAULT_SETTINGS;
