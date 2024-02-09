import { When } from "@badeball/cypress-cucumber-preprocessor";
import { camelCase, forEach } from "lodash";

When(
	/^the user clicks on the "([^"]*)" button$/,
	function (buttonName: string) {
		cy.get("button").contains(`${buttonName}`).click();
	},
);

When(
	/^inputs the "([^"]*)" as "([^"]*)" in textarea$/,
	function (fieldName: string, value: string) {
		cy.get(`textarea[name='${camelCase(fieldName)}']`)
			.clear()
			.type(value);
	},
);

When(
	/^inputs the "([^"]*)" as "([^"]*)"$/,
	function (fieldName: string, value: string) {
		cy.get(`input[name='${camelCase(fieldName)}']`)
			.clear()
			.type(value);
	},
);

When(
	/^inputs the "([^"]*)" field "([^"]*)" as "([^"]*)"$/,
	function (fieldType: "text" | "select", fieldName: string, value: string) {
		switch (fieldType) {
			case "text":
				cy.get(`input[name='${fieldName}']`).clear().type(value);
				break;
			case "select":
				cy.getWithDataTest(`{${fieldName}-content}`).click();
				cy.get(`div[data-value="${value}"]`).click();
				break;
		}
	},
);
When(
	/^select the "([^"]*)" as "([^"]*)"$/,
	function (fieldName: string, values: string) {
		const checks = values.split(", ");
		forEach(checks, (check) => {
			cy.get(`input[name='${check}']`).check();
		});
	},
);

When(/^clicks on "([^"]*)" button$/, function (buttonName: string) {
	cy.get("button").contains(`${buttonName}`).click();
});
