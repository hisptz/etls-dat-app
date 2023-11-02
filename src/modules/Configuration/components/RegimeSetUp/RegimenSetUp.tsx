import React from "react";
import { Card, Button } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { DATA_TEST_PREFIX } from "../../../shared/constants";
import { useRecoilState } from "recoil";
import { add, editRegimen } from "./state";
import { useSetting } from "@dhis2/app-service-datastore";
import AddSetting from "./components/EditRegimen";
import RegimenTable from "./components/RegimenTable";

export function RegimenSetUp() {
	const [, setAdd] = useRecoilState<boolean>(add);
	const [, setHide] = useRecoilState<boolean>(editRegimen);

	const [settings] = useSetting("regimenSetting", {
		global: true,
	});

	return (
		<div data-test={`${DATA_TEST_PREFIX}-regime-set-up-container`}>
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
								setAdd(true);
								setHide(false);
							}}
							secondary
						>
							{i18n.t("Add Setting")}
						</Button>
					</div>
					<AddSetting />
					<RegimenTable regimens={settings} loading={false} />
				</div>
			</Card>
		</div>
	);
}
