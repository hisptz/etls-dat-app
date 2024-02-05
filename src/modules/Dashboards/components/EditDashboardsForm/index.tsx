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
import { uniqBy } from "lodash";

import VisualizationOptionsField from "./components/VisualizationOptionsField";
import VisualizationSpanField from "./components/VisualizationSpanField";
import { DashboardVisualization } from "./types";
import VisualizationItem from "./components/VisualizationItem";

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

function onAddDashboardVisualizations(
	visualizations: DashboardVisualization[],
	addedVisualization: EditCustomDashboardsFormData,
): DashboardVisualization[] {
	const sanitizedVisualization = {
		id: addedVisualization.dashboardItem,
		span: addedVisualization.span,
	};

	return uniqBy([...visualizations, sanitizedVisualization], "id");
}

function onRemoveDashboardVisualization(
	visualizations: DashboardVisualization[],
	id: string,
): DashboardVisualization[] {
	return visualizations.filter((visualization) => visualization.id !== id);
}

export default function EditCustomDashboardsForm({
	onClose,
	hide,
}: EditCustomDashboardsFormProps): React.ReactElement {
	const [dashboardVisualizations, setDashboardVisualizations] = useState<
		DashboardVisualization[]
	>([]);
	const form = useForm<EditCustomDashboardsFormData>({
		resolver: zodResolver(schema),
	});

	const onCloseModal = () => {
		form.reset();
		onClose();
	};

	const onAddVisualization = (data: EditCustomDashboardsFormData) => {
		const sanitizedVisualizations = onAddDashboardVisualizations(
			dashboardVisualizations,
			data,
		);
		setDashboardVisualizations(sanitizedVisualizations);
		form.reset();
	};

	const onDeleteVisualization = (id: string) => {
		console.log("onDeleteVisualization", id);
		const sanitizedVisualizations = onRemoveDashboardVisualization(
			dashboardVisualizations,
			id,
		);
		setDashboardVisualizations(sanitizedVisualizations);
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
						marginBottom: "16px",
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
							onClick={form.handleSubmit(onAddVisualization)}
						>
							{i18n.t("Save")}
						</Button>
					</div>
				</div>

				<div>
					<p style={{ margin: "16px 8px" }}>
						{i18n.t("Selected Visualizations:")}
					</p>
					<div style={{ margin: "16px 8px" }}>
						{dashboardVisualizations &&
						dashboardVisualizations.length ? (
							dashboardVisualizations.map((visualization) => (
								<div key={visualization.id}>
									<VisualizationItem
										id={visualization.id}
										onDelete={onDeleteVisualization}
									/>
								</div>
							))
						) : (
							<p
								style={{
									textAlign: "center",
									fontSize: "14px",
								}}
							>
								{i18n.t(
									"There are no custom dashboard items added to this program. You can add from existing visualizations above",
								)}
							</p>
						)}
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
