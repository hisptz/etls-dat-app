
import React, { useState } from "react";
import { DropdownButton, FlyoutMenu, MenuItem } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { DATA_TEST_PREFIX, ReportColumn } from "../../../shared/constants";
import { downloadFile } from "../../utils/download";
type DownloadProps = { enabled: boolean, data: any[], columns: Array<ReportColumn> }

function sanitizeDownloadedData(downloadData: any[], columns: Array<ReportColumn>): any[] {
	return downloadData.map((data) => {
		const sanitizedData: Record<string, any> ={};
		for(const {label, key} of columns) {
			sanitizedData[label] = data[key] ?? "";
		}
		return sanitizedData;
	});
}

export default function Download({ enabled, data, columns }: DownloadProps) {
	const [downloading, setDownloading] = useState(false);
	const [downloadStateRef, setDownloadStateRef] = useState(false);
	const onDownloadClick = (type: "xlsx" | "json" | "csv") => () => {
		setDownloading(true);
		const sanitizedData = sanitizeDownloadedData(data, columns);
		setDownloadStateRef(false);
		downloadFile(type, sanitizedData);
		setDownloading(false);
	};

	return (
		<DropdownButton
			dataTest={`${DATA_TEST_PREFIX}-${"download"}`}
			disabled={!enabled || downloading }
			loading={downloading}
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
			{i18n.t(
				downloading ? "Downloading..." : "Download",
			)}
		</DropdownButton>
	);
}
