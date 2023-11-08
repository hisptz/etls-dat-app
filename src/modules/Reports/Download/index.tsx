import React, { useState } from "react";
import { DropdownButton, FlyoutMenu, MenuItem } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { DATA_TEST_PREFIX } from "../../shared/constants";
import {
	useDATDevices,
	useReportTableData,
} from "../components/Table/hooks/data";
import { useSearchParams } from "react-router-dom";

export default function Download({ enabled }: { enabled: boolean }) {
	const [params] = useSearchParams();
	const reportType = params.get("reportType");
	const [downloadStateRef, setDownloadStateRef] = useState(false);
	const { download, downloading } = useReportTableData();
	const { downloadFile, downloadingDAT } = useDATDevices();
	const onDownloadClick = (type: "xlsx" | "json" | "csv") => () => {
		setDownloadStateRef(false);
		reportType === "dat-device-summary-report"
			? downloadFile(type)
			: download(type);
	};

	return (
		<DropdownButton
			dataTest={`${DATA_TEST_PREFIX}-${"download"}`}
			disabled={!enabled}
			loading={downloading || downloadingDAT}
			onClick={() => setDownloadStateRef((prevState) => !prevState)}
			open={downloadStateRef}
			component={
				<div className="w-100">
					<FlyoutMenu>
						<MenuItem
							dataTest={`${DATA_TEST_PREFIX}-${"excel"}`}
							label={i18n.t("Excel")}
							onClick={onDownloadClick("xlsx")}
						/>
						<MenuItem
							dataTest={`${DATA_TEST_PREFIX}-${"csv"}`}
							label={i18n.t("CSV")}
							onClick={onDownloadClick("csv")}
						/>
						<MenuItem
							dataTest={`${DATA_TEST_PREFIX}-${"json"}`}
							label={i18n.t("JSON")}
							onClick={onDownloadClick("json")}
						/>
					</FlyoutMenu>
				</div>
			}
		>
			{i18n.t("Download")}
		</DropdownButton>
	);
}
