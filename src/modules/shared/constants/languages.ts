export interface Language {
	locale: string;
	name: string;
	flag?: string;
}

export const defaultLanguage = "en";

export const LANGUAGES: Language[] = [
	{
		name: "English",
		locale: "en",
		flag: "🇬🇧",
	},
	{
		name: "Swahili",
		locale: "sw",
		flag: "🇹🇿",
	},
];
