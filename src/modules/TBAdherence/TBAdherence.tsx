import React from "react";
import { Outlet } from "react-router-dom";
import { DATA_TEST_PREFIX } from "../shared/constants";
import { FilterArea } from "./components/FilterArea";
import i18n from "@dhis2/d2-i18n";

export function TBAdherenceOutlet() {
	return <Outlet />;
}

export function TBAdherencePage() {
	// const { patients, pagination, refetch, loading } =
	// 	useTBAdherenceTableData();

	return (
		<div
			className="column gap-32 p-16 h-100 w-100"
			data-test={`${DATA_TEST_PREFIX}-travelers-container`}
		>
			<h1>{i18n.t("TB Adherence")}</h1>
			<FilterArea loading={false} />
			<div className="flex-1">
				{/* <TBAdherenceTable
					travelers={patients}
					pagination={pagination}
					loading={loading}
				/> */}
			</div>
		</div>
	);
}
