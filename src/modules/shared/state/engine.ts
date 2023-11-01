import { atom } from "recoil";
import { DHIS2DataEngine } from "../types";

export const DataEngineState = atom<DHIS2DataEngine>({
	key: "app-engine-state",
});

export const AddDevice = atom<boolean>({
	key: "assign-device-state",
	default: true,
});

export const AddAlarm = atom<boolean>({
	key: "add-alarm-state",
	default: true,
});
