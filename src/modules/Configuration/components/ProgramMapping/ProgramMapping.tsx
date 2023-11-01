import React from "react";
import i18n from "@dhis2/d2-i18n";
import { Card, CircularLoader, Button } from "@dhis2/ui";
import styles from "./programMapping.module.css";
import { DATA_TEST_PREFIX } from "../../../shared/constants";
import { edit } from "./state";
import { useRecoilState } from "recoil";
import Edit from "./components/EditProgramMapping";
import { usePrograms } from "./hooks/data";
import { useSetting } from "@dhis2/app-service-datastore";

export function ProgramMapping() {
	const [hide, setHide] = useRecoilState<boolean>(edit);
	const {
		program,
		attributeOptions,
		programOptions,
		error,
		loading,
		refetch,
	} = usePrograms();
	const [programMapping] = useSetting("programMapping", { global: true });

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
						<h3
							className="m-0"
							style={{ fontWeight: "600", marginTop: "16px" }}
						>
							{i18n.t("Program Mapping")}
						</h3>
						<Button
							onClick={() => {
								setHide(false);
							}}
							secondary
						>
							{i18n.t("Edit")}
						</Button>
					</div>
					<div className={styles["program-mapping-container"]}>
						<div className={styles["grid-item"]}>
							<label
								className={styles["label-title"]}
								htmlFor="name"
							>
								{i18n.t("Mapped TB Program:")}
							</label>
							<label
								className={styles["label-value"]}
								htmlFor="value"
							>
								{i18n.t(program?.displayName ?? " - ")}
							</label>
						</div>
						<div className={styles["grid-item"]}>
							<label
								className={styles["label-title"]}
								htmlFor="name"
							>
								{i18n.t("Mediator url:")}
							</label>
							<label
								className={styles["label-title"]}
								htmlFor="name"
							>
								<label
									className={styles["label-value"]}
									htmlFor="value"
									style={{
										fontStyle: "italic",
										color: "#147cd7",
									}}
								>
									{i18n.t(
										programMapping.mediatorUrl ?? " - ",
									)}
								</label>
							</label>
						</div>
					</div>
				</div>
			</Card>
			{!hide && (
				<Edit
					attributeOptions={attributeOptions}
					programOptions={programOptions}
					error={error}
					onUpdate={refetch}
				/>
			)}
		</div>
	);
}
