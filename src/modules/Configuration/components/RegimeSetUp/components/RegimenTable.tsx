import React, { useState } from "react";
import {
	CustomDataTable,
	CustomDataTableColumn,
	CustomDataTableRow,
} from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";

import { isEmpty } from "lodash";
import { FullPageLoader } from "../../../../shared/components/Loaders";
import { ActionButton } from "../../../../shared/components/ActionButton";
import { RegimenSetting } from "../../../../shared/constants";
import AddSetting, { RegimenFormData } from "./EditRegimen";
import DeleteSetting from "./DeleteRegimen";

export interface regimensTableProps {
	loading: boolean;
	regimens: RegimenSetting[];
}

export default function RegimenTable({
	loading,
	regimens,
}: regimensTableProps) {
	const [hideDel, setDelete] = useState<boolean>(true);
	const [hide, setEdit] = useState<boolean>(true);
	const [selectedRegimen, setSelectedRegimen] = useState<RegimenFormData>();

	const onHide = () => {
		setEdit(true);
	};
	const onHideDel = () => {
		setDelete(true);
	};

	const regimensColumns = [
		{
			key: "sn",
			label: "S/N",
			path: "sn",
		},
		{
			key: "regimen",
			label: "Regimen",
			path: "regimen",
		},
		{
			key: "administration",
			label: "Administration",
			path: "administration",
		},
		{
			key: "numberOfDoses",
			label: "Number Of Doses",
			path: "numberOfDoses",
		},

		{
			key: "action",
			label: "Action",
			path: "action",
		},
	];

	function getActions(regimen: RegimenFormData) {
		return (
			<>
				<ActionButton
					onDelete={() => {
						setSelectedRegimen(regimen);
						setDelete(false);
					}}
					onEdit={() => {
						setSelectedRegimen(regimen);
						setEdit(false);
					}}
				></ActionButton>
			</>
		);
	}

	return (
		<div className="w-100 h-100" style={{ height: "auto" }}>
			<div className=" w-100 h-100 gap-16 column">
				{loading && isEmpty(regimens) ? (
					<FullPageLoader />
				) : (
					<>
						<CustomDataTable
							emptyLabel={i18n.t("Regimens Settings not found")}
							loading={loading}
							columns={regimensColumns as CustomDataTableColumn[]}
							rows={regimens.map((regimen, index) => {
								return {
									...(regimen as CustomDataTableRow),
									sn: index + 1,
									action: getActions(regimen),
								};
							})}
						/>

						{!hide && (
							<AddSetting
								data={selectedRegimen}
								key={selectedRegimen?.regimen}
								onHide={onHide}
								hide={hide}
							/>
						)}
						{!hideDel && (
							<DeleteSetting
								regimen={selectedRegimen?.regimen}
								onHide={onHideDel}
								hide={hideDel}
							/>
						)}
					</>
				)}
			</div>
		</div>
	);
}
