import React, { useEffect } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import { DATA_TEST_PREFIX } from "../shared/constants";
import { FilterArea } from "./components/FilterArea";
import i18n from "@dhis2/d2-i18n";
import TBAdherenceTable from "./components/Table";
import {
	useFilters,
	useTBAdherenceTableData,
} from "./components/Table/hooks/data";

export function TBAdherenceOutlet() {
	return <Outlet />;
}

export function TBAdherencePage() {
	const [params, setParams] = useSearchParams();
	const { filters, endDate, startDate } = useFilters();
	const orgUnit = params.get("ou");
	const { patients, pagination, refetch, loading } =
		useTBAdherenceTableData();

	useEffect(() => {
		refetch({
			page: 1,
			filters,
			endDate,
			startDate,
			orgUnit,
		});
	}, []);

	return (
		<div
			className="column gap-32 p-16 h-100 w-100"
			data-test={`${DATA_TEST_PREFIX}-tb-adherence-container`}
		>
			<h1 className="m-0" style={{ marginBottom: "16px" }}>
				{i18n.t("TB Adherence")}
			</h1>
			<FilterArea loading={loading} onFetch={refetch} />
			<div className="flex-1">
				<TBAdherenceTable
					patients={patients}
					pagination={pagination}
					loading={loading}
				/>
			</div>
		</div>
	);
}
