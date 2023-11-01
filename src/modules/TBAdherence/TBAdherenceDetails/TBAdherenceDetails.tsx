import React from "react";
import { usePatient } from "./hooks/data";
import { Button, Card, IconArrowLeft24 } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { useNavigate } from "react-router-dom";
import { FullPageLoader } from "../../shared/components/Loaders";
import ErrorPage from "../../shared/components/ErrorPage";
import { DATA_TEST_PREFIX } from "../../shared/constants";
import { ProfileArea } from "../../shared/components/ProfileArea";
import DoseStatus from "./components/doseStatus/doseStatus";
import AdherenceCalendar from "./components/adherenceCalendar/adherenceCalendar";
import { useDeviceData } from "../../shared/components/ProfileArea/utils";

export function TBAdherenceDetails() {
	const { patient, error, loading, refresh } = usePatient();
	const navigate = useNavigate();

	const { data, loadingDevice } = useDeviceData(
		patient?.deviceIMEINumber ?? "",
	);

	console.log(data);

	const Dose = [
		{
			color: "#42a5f5",
			status: "Enrollment Date",
		},
		{
			color: "#4caf50",
			status: "Taken the Dosage",
		},
		{
			color: "#f44336",
			status: "Missed the Dosage",
		},
		{
			color: "#f2f3f7",
			status: "N/A",
		},
	];

	if (loading && !patient) {
		return <FullPageLoader />;
	}

	if (error) {
		return <ErrorPage error={error} />;
	}

	if (!patient) {
		return null;
	}

	return (
		<div
			className="column gap-32 p-16 h-100 w-100"
			data-test={`${DATA_TEST_PREFIX}-tbadherence-details-container`}
		>
			<div className="column gap-16">
				<div>
					<Button
						onClick={() => navigate(-1)}
						icon={<IconArrowLeft24 />}
					>
						{i18n.t("Back")}
					</Button>
				</div>

				<div className="w-100">
					<ProfileArea
						profile={patient}
						refetch={refresh}
						data={data}
						loading={loading}
					/>
				</div>
				<div
					style={{
						marginTop: "12px",
						height: "auto",
					}}
				>
					<Card>
						<div style={{ padding: "12px 32px 12px 32px" }}>
							<div
								style={{
									display: "flex",
									flexDirection: "row",
									flexWrap: "wrap",
								}}
							>
								{Dose.map((dose, index) => {
									return (
										<DoseStatus
											key={index}
											color={dose.color}
											status={dose.status}
										/>
									);
								})}
							</div>
							<AdherenceCalendar
								profile={patient}
								data={data}
								laoding={loadingDevice}
							/>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
