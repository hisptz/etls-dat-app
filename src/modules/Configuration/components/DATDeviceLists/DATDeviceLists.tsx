import React from "react";
import { Card, CircularLoader, Button } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { DATA_TEST_PREFIX } from "../../../shared/constants";
import { useRecoilState } from "recoil";
import DeviceListTable from "./components/DeviceListTable";
import { add, edit } from "./state";
import EditDevice from "./components/EditDevice";

export function DATDevicelists() {
	const [, setAdd] = useRecoilState<boolean>(add);
	const [, setHide] = useRecoilState<boolean>(edit);
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
					<EditDevice />
					<DeviceListTable
						devices={[
							{ emei: "11", inUse: false },
							{ emei: "22", inUse: false },
							{ emei: "33", inUse: false },
							{ emei: "44", inUse: false },
							{ emei: "55", inUse: false },
							{ emei: "66", inUse: false },
							{ emei: "77", inUse: false },
						]}
						loading={false}
					/>
				</div>
			</Card>
		</div>
	);
}
