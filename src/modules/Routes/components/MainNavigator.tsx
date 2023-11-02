import React from "react";
import { Navigate } from "react-router-dom";
import { head } from "lodash";
import { ROUTES } from "../constants/nav";

export function MainNavigator() {
	const initialNav = head(ROUTES);
	return <Navigate to={initialNav?.path ?? "treatment-adherence"} replace />;
}
