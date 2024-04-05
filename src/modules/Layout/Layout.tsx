import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { SideNav } from "./components/SideNav";
import { FullPageLoader } from "../shared/components/Loaders";

export function Layout() {
	return (
		<div className="w-100 h-100 row stretch">
			<SideNav />
			<main
				style={{
					height: "calc(100vh - 48px)",
					overflow: "auto",
					backgroundColor: "#f8f9fa",
				}}
				className="flex-1"
			>
				<Suspense fallback={<FullPageLoader />}>
					<Outlet />
				</Suspense>
			</main>
		</div>
	);
}
