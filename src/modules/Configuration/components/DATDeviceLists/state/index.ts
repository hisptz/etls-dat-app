import { atom } from "recoil";

export const remove = atom<boolean>({
	key: "delete-device-state",
	default: true,
});

export const editDevice = atom<boolean>({
	key: "edit-device-state",
	default: true,
});

export const add = atom<boolean>({
	key: "add-device-state",
	default: false,
});
