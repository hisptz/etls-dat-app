import React, { useState } from "react";
import { Card, Button, ButtonStrip } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { DATA_TEST_PREFIX } from "../../../shared/constants";
import { useRecoilState } from "recoil";
import DeviceListTable from "./components/DeviceListTable";
import { add } from "./state";
import EditDevice from "./components/EditDevice";

import { useDevicesFromDataStore } from "./hooks/data";
import { FilterField } from "../../../DATClientOverview/components/FilterArea/components/FilterField";
import { useSearchParams } from "react-router-dom";

export function DATDevicelists() {
	const [, setAdd] = useRecoilState<boolean>(add);
	const [hide, setHide] = useState<boolean>(true);
	const { data, loadingDevice, pagination, refetch, search } =
		useDevicesFromDataStore();
	const [param] = useSearchParams();

	const searchDevice = param.get("deviceIMEINumber");

	const onHide = () => {
		setHide(true);
	};

	return (
		<div data-test={`${DATA_TEST_PREFIX}-program-mapping-container`}>
			<Card>
				<div className="w-100 h-100 column p-16">
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							justifyContent: "start",
							marginBottom: "32px",
						}}
					>
						<ButtonStrip>
							<FilterField
								name="deviceIMEINumber"
								type="text"
								label={""}
							/>
							<Button
								primary
								onClick={() => {
									search(searchDevice);
								}}
							>
								{i18n.t("Search")}
							</Button>
							<Button
								onClick={() => {
									setAdd(true);
									setHide(false);
								}}
								secondary
							>
								{i18n.t("Add Device")}
							</Button>
						</ButtonStrip>
					</div>
					{!hide && (
						<EditDevice
							refresh={refetch}
							hide={hide}
							onHide={onHide}
						/>
					)}
					<DeviceListTable
						devices={data}
						loading={loadingDevice}
						pagination={pagination}
						refresh={refetch}
					/>
				</div>
			</Card>
		</div>
	);
}
