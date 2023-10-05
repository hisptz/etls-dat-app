import { atom } from "recoil";

export const remove = atom<boolean>({
	key: "delete-state",
	default: true,
});

export const edit = atom<boolean>({
	key: "edit-state",
	default: true,
});

export const add = atom<boolean>({
	key: "add-state",
	default: true,
});
