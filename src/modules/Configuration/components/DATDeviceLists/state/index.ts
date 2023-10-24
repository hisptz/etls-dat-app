import { atom } from "recoil";

export const remove = atom<boolean>({
	key: "delete-device-state",
	default: true,
});

export const edit = atom<boolean>({
	key: "edit-device-state",
	default: true,
});

export const add = atom<boolean>({
	key: "add-device-state",
	default: false,
});
