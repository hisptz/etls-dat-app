import React, { useState } from "react";
import {
	CustomDataTable,
	CustomDataTableColumn,
	CustomDataTableRow,
} from "@hisptz/dhis2-ui";
import {
	Card,
	Button,
	Modal,
	ModalTitle,
	ModalContent,
	ModalActions,
	ButtonStrip,
	SingleSelectField,
	SingleSelectOption,
} from "@dhis2/ui";
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
			<div>
				<ActionButton
					onDelete={() => {
						setDelete(false);
					}}
					onEdit={() => {
						setEdit(false);
					}}
				/>
				<EditDevice emei={device.emei} inUse={device.inUse} />
				<DeleteDevice emei={device.emei} inUse={device.inUse} />;
				<ActionButton />
			</div>
		);
	}

	return (
		<div className="w-100 h-100">
			<div className=" w-100 h-100 gap-16 column">
				{loading && isEmpty(devices) ? (
					<FullPageLoader />
				) : (
					<CustomDataTable
						emptyLabel={i18n.t("There is no devices")}
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
				)}
			</div>
		</div>
	);
}
