import React, { useState } from "react";
import {
	CustomDataTable,
	CustomDataTableColumn,
	CustomDataTableRow,
} from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { Pagination } from "@hisptz/dhis2-utils";
import { isEmpty } from "lodash";
import { FullPageLoader } from "../../../../shared/components/Loaders";
import { ActionButton } from "../../../../shared/components/ActionButton";
import { editRegimen, remove } from "../state";
import { useRecoilState } from "recoil";

import { regimenSetting } from "../../../../shared/constants";
import AddSetting, { RegimenFormData } from "./EditRegimen";
import DeleteSetting from "./DeleteRegimen";

export interface regimensTableProps {
	loading: boolean;
	regimens: regimenSetting[];
}

export default function RegimenTable({
	loading,
	regimens,
}: regimensTableProps) {
	const [hideDel, setDelete] = useRecoilState<boolean>(remove);
	const [hide, setEdit] = useState<boolean>(true);
	const [selectedRegimen, setSelectedRegimen] = useState<RegimenFormData>();

	const onHide = () => {
		setEdit(true);
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
			key: "idealDoses",
			label: "Ideal Doses",
			path: "idealDoses",
		},
		{
			key: "idealDuration",
			label: "Ideal Duration(months)",
			path: "idealDuration",
		},
		{
			key: "completionMinimumDoses",
			label: "Completion Minimum\nDoses",
			path: "completionMinimumDoses",
		},
		{
			key: "completionMaximumDuration",
			label: "Completion Maximum\nDuration",
			path: "completionMaximumDuration",
		},
		{
			key: "action",
			label: "Action",
			path: "action",
		},
	];

	function getActions(regimen: RegimenFormData, index: number) {
		return (
			<>
				<ActionButton
					onDelete={() => {
						setDelete(false);
						setSelectedRegimen(regimen);
					}}
					onEdit={() => {
						setEdit(false);
						setSelectedRegimen(regimen);
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
									action: getActions(
										regimen,
										index ?? undefined,
									),
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
							<DeleteSetting regimen={selectedRegimen?.regimen} />
						)}
					</>
				)}
			</div>
		</div>
	);
}
