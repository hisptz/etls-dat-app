import React from "react";
import {Button, colors, IconError24} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import {useNavigate} from "react-router-dom";

export function PageNotFound() {
	const navigate = useNavigate();
	return (
		<div className="w-100 h-100 column center align-center gap-16">
			<div className="size-48">
				<IconError24 color={colors.grey800}/>
			</div>
			<h3 className="m-0" style={{color: colors.grey800}}>{i18n.t("Something went wrong")}</h3>
			<p>{i18n.t("The page you are looking for does not exist.")}</p>
			<Button primary onClick={() => navigate("/")}>{i18n.t("Go to home page")}</Button>
		</div>
	);
}
