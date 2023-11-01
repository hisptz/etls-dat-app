import React from "react";
import { Card, Button } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { DATA_TEST_PREFIX } from "../../../shared/constants";
import { useRecoilState } from "recoil";
import DeviceListTable from "./components/DeviceListTable";
import { add, editDevice } from "./state";
import EditDevice from "./components/EditDevice";
import { useSetting } from "@dhis2/app-service-datastore";

export function DATDevicelists() {
	const [, setAdd] = useRecoilState<boolean>(add);
	const [hide, setHide] = useRecoilState<boolean>(editDevice);
	const [deviceEmeiList] = useSetting("deviceEmeiList", { global: true });

	return (
		<div data-test={`${DATA_TEST_PREFIX}-program-mapping-container`}>
			<Card>
				<div className="w-100 h-100 column p-16">
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							justifyContent: "space-between",
							marginBottom: "32px",
						}}
					>
						<Button
							onClick={() => {
								setAdd(true);
								setHide(false);
							}}
							secondary
						>
							{i18n.t("Add Device")}
						</Button>
					</div>
					{!hide && <EditDevice />}
					<DeviceListTable devices={deviceEmeiList} loading={false} />
				</div>
			</Card>
		</div>
	);
}
