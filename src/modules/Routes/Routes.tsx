import { createHashRouter, RouterProvider } from "react-router-dom";
import { MainNavigator } from "./components/MainNavigator";
import { ROUTES } from "./constants/nav";
import { resolveRoute } from "./utils/nav";
import React, { Suspense } from "react";
import { FullPageLoader } from "../shared/components/Loaders";
import ErrorPage from "../shared/components/ErrorPage";
import { Layout } from "../Layout";

import { PageNotFound } from "./components/PageNotFound";

const router = createHashRouter([
	{
		path: "*",
		element: <PageNotFound />,
	},

	{
		path: "/",
		element: <Layout />,
		errorElement: <ErrorPage />,
		children: [
			{
				path: "/",
				element: <MainNavigator />,
				errorElement: <ErrorPage />,
				index: true,
			},
			...ROUTES.map(resolveRoute),
		],
	},
]);

export function Routes() {
	return (
		<Suspense fallback={<FullPageLoader />}>
			<RouterProvider router={router} />
		</Suspense>
	);
}
