import { useAlert, useDataMutation } from "@dhis2/app-runtime";
import { Option } from "./data";

const mutation: any = {
	type: "update",
	resource: "optionGroups",
	id: ({ id }: any) => id,
	data: ({ data }: any) => data,
};

export function useManageHighRiskCountries({
	onComplete,
	countries,
	optionGroup,
}: {
	onComplete: () => void;
	optionGroup: any;
	countries: Option[];
}) {
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);
	const [update, { loading }] = useDataMutation(mutation, {
		onError: (error) => {
			show({
				message: `Could not update: ${error.message}`,
				type: { info: true },
			});
		},
		onComplete: () => {
			show({ message: "Update successful", type: { success: true } });
			onComplete();
		},
	});
	const onUpdate = async (selected: string[]) => {
		const selectedOptions = countries.filter(({ code }) =>
			selected.includes(code),
		);
		const payload = {
			...optionGroup,
			options: selectedOptions,
		};
		await update({
			data: payload,
			id: optionGroup.id,
		});
	};

	return {
		onUpdate,
		loading,
	};
}
