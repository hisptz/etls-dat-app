import React, { useState } from "react";
import i18n from "@dhis2/d2-i18n";
import { Card, CircularLoader, Button } from "@dhis2/ui";
import { DATA_TEST_PREFIX } from "../../../shared/constants";
import ProgramMappingForm from "./components/ProgramMappingForm";
import { usePrograms } from "./hooks/data";
import { useSetting } from "@dhis2/app-service-datastore";
import ProgramMappingTable from "./components/ProgramMappingTable";

export function ProgramMapping() {
	const [hide, setHide] = useState<boolean>(true);
	const { attributeOptions, programOptions, error, loading, refetch } =
		usePrograms();
	const [programMapping] = useSetting("programMapping", { global: true });

	const onHide = () => {
		setHide(true);
	};

	return loading ? (
		<div
			style={{ minHeight: 600 }}
			className="h-100 w-100 row align-center center p-16"
		>
			<CircularLoader small />
		</div>
	) : (
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
								setHide(false);
							}}
							secondary
						>
							{i18n.t("Add Mapping")}
						</Button>
					</div>
					{!hide && (
						<ProgramMappingForm
							attributeOptions={attributeOptions}
							programOptions={programOptions}
							error={error}
							onUpdate={refetch}
							hide={hide}
							onHide={onHide}
						/>
					)}
					<ProgramMappingTable
						programMapping={programMapping}
						loading={false}
					/>
				</div>
			</Card>
		</div>
	);
}
