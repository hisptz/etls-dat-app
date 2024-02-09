import React from "react";
import { SettingsTab } from "./components/SettingsTab";
import { Outlet } from "react-router-dom";
import { DATA_TEST_PREFIX, MANAGER_USER_GROUP_CODE } from "../shared/constants";
import i18n from "@dhis2/d2-i18n";
import { useRecoilValue } from "recoil";
import { CurrentUserGroup } from "../shared/state/currentUser";

export function Configuration() {
	const currentUserGroup = useRecoilValue(CurrentUserGroup);

	const hasAccess = currentUserGroup.some(
		(userGroup) => userGroup.code === MANAGER_USER_GROUP_CODE,
	);

	if (!hasAccess) {
		return null;
	}

	return (
		<div
			className="column gap-16 p-16 h-100 w-100"
			data-test={`${DATA_TEST_PREFIX}-configuration-container`}
		>
			<h1 className="m-0" style={{ marginBottom: "0px" }}>
				{i18n.t("Configurations")}
			</h1>
			<SettingsTab />
			<div className="flex-1">
				<Outlet />
			</div>
		</div>
	);
}
