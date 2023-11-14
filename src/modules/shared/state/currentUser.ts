import { selector } from "recoil";
import { CurrentUser } from "../types/user";
import { DataEngineState } from "./engine";
import { CURRENT_USER_QUERY } from "../constants";

export const CurrentUserSelector = selector<CurrentUser | undefined>({
	key: "current-user-selector",
	get: async ({ get }) => {
		const engine: any = get(DataEngineState);
		const currentUser = await engine?.query(CURRENT_USER_QUERY);
		return currentUser?.me;
	},
});