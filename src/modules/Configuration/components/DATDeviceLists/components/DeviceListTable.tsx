import React, { useState } from "react";
import {
	CustomDataTable,
	CustomDataTableColumn,
	CustomDataTableRow,
} from "@hisptz/dhis2-ui";
import { Card } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { Pagination } from "@hisptz/dhis2-utils";
import { useSetting } from "@dhis2/app-service-datastore";

import { isEmpty } from "lodash";
import { FullPageLoader } from "../../../../shared/components/Loaders";
import { ActionButton } from "../../../../shared/components/ActionButton";
import { deviceConfig } from "../models/device";
import { edit, remove } from "../state";
import { useRecoilState } from "recoil";
import DeleteDevice from "./DeleteDevice";
import EditDevice from "./EditDevice";

export interface DevicesTableProps {
	loading: boolean;
	devices: deviceConfig[];
}

export default function DeviceListTable({
	loading,
	devices,
}: DevicesTableProps) {
	const [, setDelete] = useRecoilState<boolean>(remove);
	const [, setEdit] = useRecoilState<boolean>(edit);
	const [selectedDevice, setSelectedDevice] = useState<deviceConfig | null>();

	const devicesColumns = [
		{
			key: "sn",
			label: "S/N",
			path: "sn",
		},
		{
			key: "emei",
			label: "IMEI Number",
			path: "emei",
		},
		{
			key: "action",
			label: "Action",
			path: "action",
		},
	];
	function getActions(device: deviceConfig) {
		return (
			<>
				<ActionButton
					onDelete={() => {
						setDelete(false);
						setSelectedDevice(device);
					}}
					onEdit={() => {
						setEdit(false);
						setSelectedDevice(device);
					}}
				></ActionButton>
			</>
		);
	}

	return (
		<div className="w-100 h-100">
			<div className=" w-100 h-100 gap-16 column">
				{loading && isEmpty(devices) ? (
					<FullPageLoader />
				) : (
					<>
						<CustomDataTable
							emptyLabel={i18n.t("There are no devices")}
							loading={loading}
							columns={devicesColumns as CustomDataTableColumn[]}
							rows={devices.map((device, index) => {
								return {
									...(device as CustomDataTableRow),
									sn: index + 1,
									action: getActions(device),
								};
							})}
						/>
						<EditDevice emei={selectedDevice?.emei} />
						<DeleteDevice emei={selectedDevice?.emei} />
					</>
				)}
			</div>
		</div>
	);
}
