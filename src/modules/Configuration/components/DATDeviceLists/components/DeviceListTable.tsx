import React, { useState } from "react";
import {
	CustomDataTable,
	CustomDataTableColumn,
	CustomDataTableRow,
} from "@hisptz/dhis2-ui";
import { Card } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { Pagination } from "@hisptz/dhis2-utils";

import { isEmpty } from "lodash";
import { FullPageLoader } from "../../../../shared/components/Loaders";
import { ActionButton } from "../../../../shared/components/ActionButton";

import DeleteDevice from "./DeleteDevice";
import EditDevice, { DeviceFormData } from "./EditDevice";
import { deviceIMEIList } from "../../../../shared/constants";

export interface DevicesTableProps {
	loading: boolean;
	devices: deviceIMEIList[];
}

export default function DeviceListTable({
	loading,
	devices,
}: DevicesTableProps) {
	const [hideDel, setDelete] = useState<boolean>(true);
	const [hide, setEdit] = useState<boolean>(true);
	const [selectedDevice, setSelectedDevice] = useState<DeviceFormData>();

	const devicesColumns = [
		{
			key: "sn",
			label: "S/N",
			path: "sn",
		},
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
						{!hide && (
							<EditDevice
								data={selectedDevice}
								hide={hide}
								onHide={onHide}
							/>
						)}
						{!hideDel && (
							<DeleteDevice
								IMEI={selectedDevice?.IMEI}
								inUse={selectedDevice?.inUse}
								hide={hideDel}
								onHide={onHideDel}
							/>
						)}
					</>
				)}
			</div>
		</div>
	);
}
