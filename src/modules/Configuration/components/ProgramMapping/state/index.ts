import { atom } from "recoil";

export const edit = atom<boolean>({
	key: "edit-program-mapping-state",
	default: true,
});
