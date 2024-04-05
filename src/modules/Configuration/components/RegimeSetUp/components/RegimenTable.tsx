import React, { useState } from "react";
import {
	CustomDataTable,
	CustomDataTableColumn,
	CustomDataTableRow,
} from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";

import { head, isEmpty } from "lodash";
import { FullPageLoader } from "../../../../shared/components/Loaders";
import { ActionButton } from "../../../../shared/components/ActionButton";
import { RegimenSetting } from "../../../../shared/constants";
import AddSetting, { RegimenFormData } from "./EditRegimen";
import DeleteSetting from "./DeleteRegimen";
import { useSetting } from "@dhis2/app-service-datastore";
import { useRegimens } from "../hooks/data";

export interface regimensTableProps {
	loading: boolean;
	regimens: RegimenSetting[];
}

export default function RegimenTable({
	loading,
	regimens,
}: regimensTableProps) {
	const [hideDel, setDelete] = useState<boolean>(true);
	const { loading: loadingRegimens, allRegimenOptions } = useRegimens();
	const [hide, setEdit] = useState<boolean>(true);
	const [selectedRegimen, setSelectedRegimen] = useState<RegimenFormData>();
	const [programMapping] = useSetting("programMapping", {
		global: true,
	});

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
			key: "program",
			label: "Program",
			path: "program",
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

	function getMappedProgram(regimen: RegimenFormData) {
		const attribute = head(
			allRegimenOptions.filter(
				(option) => regimen.regimen === option.code,
			),
		);

		const programName = head(
			programMapping
				.map((mapping: any) => {
					return mapping.attributes.regimen === attribute?.attributeID
						? mapping.name
						: null;
				})
				.filter((name: any) => name != null),
		);

		return programName ?? "Loading...";
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
								getMappedProgram(regimen);
								return {
									...(regimen as CustomDataTableRow),
									sn: index + 1,
									program: getMappedProgram(regimen),
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
