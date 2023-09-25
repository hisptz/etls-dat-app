import "./styles/common.css";
import React, { Suspense } from "react";
import { Routes } from "./modules/Routes";
import { FullPageLoader } from "./modules/shared/components/Loaders";

const MyApp = () => (
	<div>
		<Suspense fallback={<FullPageLoader />}>
			<Routes />
		</Suspense>
	</div>
);

export default MyApp;
