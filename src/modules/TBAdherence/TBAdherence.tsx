import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { DATA_TEST_PREFIX } from "../shared/constants";
import { FilterArea } from "./components/FilterArea";
import i18n from "@dhis2/d2-i18n";
import TBAdherenceTable from "./components/Table";
import { Card, Center } from "@dhis2/ui";
import { useTBAdherenceTableData } from "./components/Table/hooks/data";
import { useSetting } from "@dhis2/app-service-datastore";
import { isEmpty } from "lodash";
import { ProgramsTab } from "./components/ProgramsTab";

export function TreatmentAdherenceOutlet() {
	return <Outlet />;
}

export function TBAdherencePage() {
	const [programMapping] = useSetting("programMapping", { global: true });
	const { patients, pagination, refetch, loading } =
		useTBAdherenceTableData();
	const navigate = useNavigate();

	return (
		<div
			className="column gap-32 p-16 h-100 w-100"
			data-test={`${DATA_TEST_PREFIX}-tb-adherence-container`}
		>
			<h1 className="m-0" style={{ marginBottom: "5px" }}>
				{i18n.t("Treatment Adherence")}
			</h1>
			{!isEmpty(programMapping) ? <ProgramsTab /> : null}
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
								</div>
							</Center>
						</Card>
					</div>
				) : (
					<div style={{ marginTop: "16px" }}>
						<TBAdherenceTable
							patients={patients}
							pagination={pagination}
							loading={loading}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
