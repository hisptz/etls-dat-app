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
import { editDevice, remove } from "../state";
import { useRecoilState } from "recoil";
import DeleteDevice from "./DeleteDevice";
import EditDevice, { DeviceFormData } from "./EditDevice";
import { deviceEmeiList } from "../../../../shared/constants";

export interface DevicesTableProps {
	loading: boolean;
	devices: deviceEmeiList[];
}

export default function DeviceListTable({
	loading,
	devices,
}: DevicesTableProps) {
	const [hideDel, setDelete] = useRecoilState<boolean>(remove);
	const [hide, setEdit] = useRecoilState<boolean>(editDevice);
	const [selectedDevice, setSelectedDevice] = useState<DeviceFormData>();

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

	function getActions(device: DeviceFormData) {
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
		<div className="w-100 h-100" style={{ height: "62vh" }}>
			<div
				className=" w-100 h-100 gap-16 column"
				style={{ overflowY: "scroll" }}
			>
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
						{!hide && <EditDevice data={selectedDevice} />}
						{!hideDel && (
							<DeleteDevice
								emei={selectedDevice?.emei}
								inUse={selectedDevice?.inUse}
							/>
						)}
					</>
				)}
			</div>
		</div>
	);
}
