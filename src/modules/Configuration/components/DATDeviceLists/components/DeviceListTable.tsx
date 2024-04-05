import React, { useState } from "react";
import {
	CustomDataTable,
	CustomDataTableColumn,
	CustomDataTableRow,
} from "@hisptz/dhis2-ui";
import { IconCheckmark24 } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { Pagination } from "@hisptz/dhis2-utils";

import { isEmpty } from "lodash";
import { FullPageLoader } from "../../../../shared/components/Loaders";
import { ActionButton } from "../../../../shared/components/ActionButton";

import DeleteDevice from "./DeleteDevice";
import EditDevice, { DeviceFormData } from "./EditDevice";
import { DeviceIMEIList } from "../../../../shared/constants";

export interface DevicesTableProps {
	loading: boolean;
	devices: DeviceIMEIList[];
	pagination: Pagination;
	refresh: (newDevices: any) => void;
}

export function InUseDevice({ IMEI }: { IMEI: string }) {
	return (
		<div>
			{IMEI} <IconCheckmark24 color={"#4caf50"} />
		</div>
	);
}

export default function DeviceListTable({
	loading,
	devices,
	pagination,
	refresh,
}: DevicesTableProps) {
	const [hideDel, setDelete] = useState<boolean>(true);
	const [hide, setEdit] = useState<boolean>(true);
	const [selectedDevice, setSelectedDevice] = useState<DeviceFormData>();

	const devicesColumns = [
		{
			key: "IMEI",
			label: "IMEI Number",
			path: "IMEI",
		},
		{
			key: "action",
			label: "Action",
			path: "action",
		},
	];

	const onHide = () => {
		setEdit(true);
	};

	const onHideDel = () => {
		setDelete(true);
	};

	function getActions(device: DeviceFormData) {
		return (
			<>
				<ActionButton
					onEdit={() => {
						setEdit(false);
						setSelectedDevice(device);
					}}
					onDelete={() => {
						setDelete(false);
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
							pagination={pagination}
							columns={devicesColumns as CustomDataTableColumn[]}
							rows={devices.map((device, index) => {
								const inUse = device.inUse;

								return {
									...(device as CustomDataTableRow),
									IMEI: inUse ? (
										<InUseDevice IMEI={device.IMEI} />
									) : (
										device.IMEI
									),

									action: getActions(device),
								};
							})}
						/>
						{!hide && (
							<EditDevice
								data={selectedDevice}
								hide={hide}
								onHide={onHide}
								refresh={refresh}
							/>
						)}
						{!hideDel && (
							<DeleteDevice
								IMEI={selectedDevice?.IMEI}
								inUse={selectedDevice?.inUse}
								hide={hideDel}
								onHide={onHideDel}
								refresh={refresh}
							/>
						)}
					</>
				)}
			</div>
		</div>
	);
}
