import React, { useState } from "react";

import {
	Button,
	Modal,
	ModalTitle,
	ModalContent,
	ModalActions,
	ButtonStrip,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import VisualizationOptionsField from "./components/VisualizationOptionsField";
import VisualizationSpanField from "./components/VisualizationSpanField";

const schema = z.object({
	dashboardItem: z
		.string({ required_error: "Dashboard Item is required" })
		.nonempty("Dashboard Item is required"),
	span: z.number({ required_error: "Span is required" }).int().max(4).min(1),
});

export type EditCustomDashboardsFormData = z.infer<typeof schema>;

type EditCustomDashboardsFormProps = {
	onClose: () => void;
	hide: boolean;
};

export default function EditCustomDashboardsForm({
	onClose,
	hide,
}: EditCustomDashboardsFormProps): React.ReactElement {
	const form = useForm<EditCustomDashboardsFormData>({
		resolver: zodResolver(schema),
	});

	const onCloseModal = () => {
		form.reset();
		onClose();
	};

	const onSubmit = async (data: EditCustomDashboardsFormData) => {
		console.log(data);
		// form.reset();
	};

	return (
		<Modal position="middle" hide={hide} onClose={onClose}>
			<ModalTitle>{i18n.t("Edit Dashboard")}</ModalTitle>
			<ModalContent>
				<div
					style={{
						display: "flex",
						gap: "16px",
						alignItems: "end",
					}}
				>
					<FormProvider {...form}>
						<div style={{ flex: 1 }}>
							<VisualizationOptionsField />
						</div>
						<div>
							<VisualizationSpanField />
						</div>
					</FormProvider>
					<div>
						<Button
							loading={form.formState.isSubmitting}
							onClick={form.handleSubmit(onSubmit)}
						>
							{i18n.t("Save")}
						</Button>
					</div>
				</div>
			</ModalContent>
			<ModalActions>
				<ButtonStrip end>
					<Button onClick={onCloseModal}>{i18n.t("Cancel")}</Button>
					<Button primary onClick={onClose}>
						{i18n.t("Save")}
					</Button>
				</ButtonStrip>
			</ModalActions>
		</Modal>
	);
}
