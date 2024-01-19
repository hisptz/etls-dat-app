import React from "react";
import { usePatient } from "./hooks/data";
import { Button, IconArrowLeft24 } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { useNavigate } from "react-router-dom";
import { FullPageLoader } from "../../shared/components/Loaders";
import ErrorPage from "../../shared/components/ErrorPage";
import { DATA_TEST_PREFIX } from "../../shared/constants";
import { ProfileArea } from "../../shared/components/ProfileArea";

import { useDeviceData } from "../../shared/components/ProfileArea/utils";

export function DATAssignmentDetails() {
	const { patient, error, loading, refresh } = usePatient();
	const navigate = useNavigate();

	const { data, loadingDevice, refetchDevice } = useDeviceData(
		patient?.deviceIMEINumber,
	);

	if (loading || loadingDevice) {
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
			data-test={`${DATA_TEST_PREFIX}-dat-assignment-details-container`}
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
						refetchDevice={refetchDevice}
					/>
				</div>
			</div>
		</div>
	);
}
