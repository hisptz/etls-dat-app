import { selector } from "recoil";
import { CurrentUser } from "../types/user";
import { DataEngineState } from "./engine";

const currentUserQuery: any = {
	me: {
		resource: "me",
		param: {
			fields: "id,name,userGroups,organisationUnits[id,displayName,path]",
		},
	},
};

export const CurrentUserSelector = selector<Promise<CurrentUser | undefined>>({
	key: "current-user-selector",
	get: async ({ get }) => {
		const engine: any = get(DataEngineState);
		const currentUser = await engine?.query(currentUserQuery);
		return currentUser ?? undefined;
	},
});
