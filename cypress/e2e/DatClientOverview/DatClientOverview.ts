import { Then, When } from "@badeball/cypress-cucumber-preprocessor";

When(/^the user clicks on the "([^"]*)" tab$/, function (tab: string) {
	const sanitizedTab = tab;
	cy.getWithDataTest(`{${sanitizedTab}-tab-item}`).click();
});

Then("the user selects an organisation unit", function () {
	cy.get(
		'[data-test="dhis2-uiwidgets-orgunittree"] > :nth-child(1) > :nth-child(1) > .jsx-3879512297',
	)
		.click()
		.wait(5000)
		.get(
			'[data-test="dhis2-uiwidgets-orgunittree"] > :nth-child(1) > :nth-child(2) > :nth-child(2) > :nth-child(1) > :nth-child(1) > .jsx-3879512297',
		)
		.click()
		.wait(5000)
		.get(
			":nth-child(1) > :nth-child(2) > :nth-child(2) > :nth-child(4) > :nth-child(1) > .jsx-3879512297",
		)
		.click()
		.wait(5000)
		.get(
			':nth-child(4) > :nth-child(2) > .open > :nth-child(5) > [data-test="dhis2-uiwidgets-orgunittree-node-content"] > [data-test="dhis2-uiwidgets-orgunittree-node-label"] > div.jsx-1077964942 > .jsx-1077964942 > [data-test="dhis2-uicore-checkbox"] > input.jsx-4249355495',
		)
		.click();
});

Then("the user selects the DAT Client", function () {
	cy.get(
		'[data-test="dhis2-uicore-tablebody"] > :nth-child(1) > :nth-child(3)',
	).click();
});

Then(/^user switch the "([^"]*)" alarm on$/, function (switchName) {
	cy.getWithDataTest(`{${switchName}}`)
		.find('input[type="checkbox"]')
		.then(($checkbox) => {
			const isSwitchOff = $checkbox[0].checked;

			if (!isSwitchOff) {
				cy.getWithDataTest(`{${switchName}}`).click();
			}
		});
});

Then(/^checks the days of the alarm "([^"]*)"$/, function (daysString) {
	const days = daysString.split(",");

	days.map((day: string) => cy.getWithDataTest(`{${day}}`).click());
});

Then("the client should be updated succesfully", () => {
	cy.get('[data-test="dhis2-uicore-alertbar"]').should("be.visible");
});
