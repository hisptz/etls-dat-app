import { atom } from "recoil";

export const selectedDevice = atom<string>({
	key: "selected-device-state",
	default: undefined,
});
