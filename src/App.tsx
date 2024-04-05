import "./styles/common.css";
import React, { Suspense } from "react";
import {Helmet} from "react-helmet";
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

	return (<>
		<Helmet>
			<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
			<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
			<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
			<link rel="manifest" href="/site.webmanifest"/>
		</Helmet>
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
	</>);
}

export default MyApp;
