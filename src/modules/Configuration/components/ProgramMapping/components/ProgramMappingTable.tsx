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
import { ProgramMapping } from "../../../../shared/constants";
import ProgramMappingForm from "./ProgramMappingForm";
import { useProgramName, usePrograms } from "../hooks/data";
import ProgramMappingDeleteModal from "./ProgramMappingDeleteModal";

export interface mappingTableProps {
	loading: boolean;
	programMapping: ProgramMapping[];
}

export default function RegimenTable({
	loading,
	programMapping,
}: mappingTableProps) {
	const [hideDel, setDelete] = useState<boolean>(true);
	const [hide, setEdit] = useState<boolean>(true);
	const [selectedProgram, setSelectedProgram] = useState<ProgramMapping>();
	const { attributeOptions, programOptions, error } = usePrograms();
	const { programName, refetch, loadingNames } = useProgramName();

	const onHide = () => {
		setEdit(true);
	};

	const onHideDel = () => {
		setDelete(true);
	};

	const programMappingColumns = [
		{
			key: "sn",
			label: "S/N",
			path: "sn",
		},
		{
			key: "name",
			label: "Name",
			path: "name",
		},
		{
			key: "mappedProgram",
			label: "Mapped Program",
			path: "mappedProgram",
		},
		{
			key: "mediatorUrl",
			label: "Mediator Url",
			path: "mediatorUrl",
		},

		{
			key: "action",
			label: "Actions",
			path: "action",
		},
	];

	function getActions(programMapping: ProgramMapping, index: number) {
		return (
			<>
				<ActionButton
					onDelete={() => {
						setSelectedProgram(programMapping);
						setDelete(false);
					}}
					onEdit={() => {
						setSelectedProgram(programMapping);
						setEdit(false);
					}}
				></ActionButton>
			</>
		);
	}

	return (
		<div className="w-100 h-100" style={{ height: "auto" }}>
			<div className=" w-100 h-100 gap-16 column">
				{loading && isEmpty(programMapping) ? (
					<FullPageLoader />
				) : (
					<>
						<CustomDataTable
							emptyLabel={i18n.t("Program Mappings not found")}
							loading={loading}
							columns={
								programMappingColumns as CustomDataTableColumn[]
							}
							rows={programMapping.map((mapping, index) => {
								return {
									...(mapping as CustomDataTableRow),
									sn: index + 1,
									action: getActions(
										mapping,
										index ?? undefined,
									),
									mappedProgram: loadingNames
										? "Loading..."
										: programName?.map((program) => {
											if (
												program.id ===
													mapping.program
											) {
												return program.displayName;
											}
										  }),
								};
							})}
						/>

						{!hide && (
							<ProgramMappingForm
								attributeOptions={attributeOptions}
								programOptions={programOptions}
								error={error}
								onUpdate={refetch}
								hide={hide}
								onHide={onHide}
								data={selectedProgram}
							/>
						)}
						{!hideDel && (
							<ProgramMappingDeleteModal
								mappedProgram={selectedProgram?.name}
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
