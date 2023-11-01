import "./styles/common.css";
import React, { Suspense } from "react";
import { Routes } from "./modules/Routes";
import { FullPageLoader } from "./modules/shared/components/Loaders";
import { DataStoreProvider } from "@dhis2/app-service-datastore";
import { MutableSnapshot, RecoilRoot } from "recoil";
import {
	DATASTORE_NAMESPACE,
	DEFAULT_SETTINGS,
} from "./modules/shared/constants";
import { useDataEngine } from "@dhis2/app-runtime";
import { DataEngineState } from "./modules/shared/state";
import "react-tooltip/dist/react-tooltip.css";

function MyApp() {
	const engine = useDataEngine();

	function initEngine({ set }: MutableSnapshot) {
		set(DataEngineState, engine);
	}

	return (
		<DataStoreProvider
			defaultGlobalSettings={DEFAULT_SETTINGS}
			namespace={DATASTORE_NAMESPACE}
			loadingComponent={<FullPageLoader />}
		>
			<RecoilRoot initializeState={initEngine}>
				<Suspense fallback={<FullPageLoader />}>
					<Routes />
				</Suspense>
			</RecoilRoot>
		</DataStoreProvider>
	);
}

export default MyApp;
