import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { DATA_TEST_PREFIX, MANAGER_USER_GROUP_CODE } from "../shared/constants";
import { FilterArea } from "./components/FilterArea";
import i18n from "@dhis2/d2-i18n";
import { Card, Center } from "@dhis2/ui";
import { useDATClientTableData } from "./components/Table/hooks/data";
import { useSetting } from "@dhis2/app-service-datastore";
import { isEmpty } from "lodash";

import DATClientTable from "./components/Table/DATClientOverviewTable";
import { ProgramsTab } from "../shared/components/ProgramsTab";
import { useRecoilValue } from "recoil";
import { CurrentUserGroup } from "../shared/state/currentUser";

export function DATClientOverviewOutlet() {
	return <Outlet />;
}

export function DATClientOverview() {
	const [programMapping] = useSetting("programMapping", { global: true });
	const {
		patients,
		pagination,
		refetch,
		loading,
		onSort,
		sortState,
		refreshing,
	} = useDATClientTableData();
	const navigate = useNavigate();
	const currentUserGroup = useRecoilValue(CurrentUserGroup);

	const hasAccess = currentUserGroup.some(
		(userGroup) => userGroup.code === MANAGER_USER_GROUP_CODE,
	);

	return (
		<div
			className="column gap-16 p-16 h-100 w-100"
			data-test={`${DATA_TEST_PREFIX}-dat-client-overview-container`}
		>
			<h1 className="m-0" style={{ marginBottom: "0px" }}>
				{i18n.t("DAT Client Overview")}
			</h1>
			{programMapping.length > 1 ? <ProgramsTab /> : null}
			<FilterArea loading={loading} onFetch={refetch} />
			<div className="flex-1">
				{isEmpty(programMapping) ? (
					<div style={{ marginTop: "16px" }}>
						<Card>
							<Center>
								<div
									style={{
										padding: "32px",
										height: "61vh",
										fontSize: "18px",
										color: "#6e7a8b",
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
									}}
								>
									{hasAccess ? (
										<>
											<span>
												{i18n.t(
													"Program Mappings are not configured. Please click the link below to go to configurations.",
												)}
											</span>
											<br />
											<span
												style={{
													color: "#1362bc",
													cursor: "pointer",
													fontWeight: "600",
												}}
												onClick={() =>
													navigate("/configuration")
												}
											>
												{i18n.t("Configuration")}
											</span>
										</>
									) : (
										<span>
											{i18n.t(
												"Program Mappings are not configured. Please contact the administrators.",
											)}
										</span>
									)}
								</div>
							</Center>
						</Card>
					</div>
				) : (
					<div style={{ marginTop: "16px" }}>
						<DATClientTable
							patients={patients}
							pagination={pagination}
							loading={loading || refreshing}
							onSort={onSort}
							sortState={sortState}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
