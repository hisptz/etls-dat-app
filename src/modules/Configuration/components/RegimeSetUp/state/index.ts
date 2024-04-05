import { atom } from "recoil";

export const remove = atom<boolean>({
	key: "delete-regimen-state",
	default: true,
});

export const editRegimen = atom<boolean>({
	key: "edit-regimen-state",
	default: true,
});

export const add = atom<boolean>({
	key: "add-regimen-state",
	default: false,
});
