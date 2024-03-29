import { atom } from "recoil";

export const DATDevicesReportState = atom<any[]>({
	key: "dat-devices-report-data",
	default: [],
});

export const DHIS2ReportState = atom<any[]>({
	key: "d2-report-data",
	default: [],
});
