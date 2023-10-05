import React, { useEffect, useState } from "react";
import i18n from "@dhis2/d2-i18n";
import { Button } from "@dhis2/ui";
import { OrgUnitSelectorModal } from "@hisptz/dhis2-ui";
import { useRecoilState } from "recoil";
import { OrganizationUnitState } from "../../../../state/filters";
import { useSearchParams } from "react-router-dom";
import { OrganisationUnit } from "@hisptz/dhis2-utils";
import { useOrgUnit } from "../../../../utils/orgUnits";
import { compact } from "lodash";
import { DATA_TEST_PREFIX } from "../../../../../shared/constants";

export default function OrganisationUnitSelector() {
	const [hide, setHide] = useState(true);
	const [organizationUnits, setOrganizationUnitState] = useRecoilState(
		OrganizationUnitState
	);
	const [params, setParams] = useSearchParams();
	const { loading, orgUnit: orgUnitWithData } = useOrgUnit();
	const onChange = ({ value }: { value: OrganisationUnit[] }) => {
		setParams((params) => {
			const updatedParams = new URLSearchParams(params);

			const joinedValue = value.map((ou) => ou.id).join(";");
			updatedParams.set("ou", joinedValue);

			return updatedParams;
		});
	};

	useEffect(() => {
		setOrganizationUnitState(compact(orgUnitWithData));
	}, [orgUnitWithData]);

	return (
		<div style={{ margin: "3px" }}>
			<Button
				id="organisationUnit"
				name="organisationUnit"
				data-test={`${DATA_TEST_PREFIX}-organisationUnit`}
				loading={loading}
				secondary
				onClick={() => {
					setHide(!hide);
				}}
			>
				{organizationUnits.length == 0
					? i18n.t("Select Organisation unit")
					: organizationUnits.map(
							(ou: OrganisationUnit, index: number) => (
								<div key={ou.id}>
									{ou.displayName}
									{index < organizationUnits!.length - 1 &&
										",\u00A0"}
								</div>
							)
					  )}
			</Button>
			{loading ? null : (
				<OrgUnitSelectorModal
					value={{
						orgUnits: compact(orgUnitWithData),
					}}
					hide={hide}
					onClose={() => {
						setHide(!hide);
					}}
					onUpdate={async (val: any) => {
						setOrganizationUnitState(val.orgUnits);
						onChange({ value: val.orgUnits });
						if (val.orgUnits.length == 0) {
							setOrganizationUnitState(organizationUnits);
							onChange({ value: organizationUnits });
						}
						setHide(!hide);
					}}
				/>
			)}
		</div>
	);
}
