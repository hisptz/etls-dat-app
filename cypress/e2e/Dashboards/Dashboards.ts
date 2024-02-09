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

Then("the user selects the reports options", () => {
	cy.get(
		'[style="font-weight: 400; cursor: pointer; font-size: 16px; margin-right: 10px; align-items: center; display: flex; justify-content: start;"] > span',
	).click();
});

Then(/^the user selects report type "([^"]*)"$/, (reportName) => {
	cy.getWithDataTest(`{${reportName}}`).click();
});

Then("the user selects the organisation units options", () => {
	cy.get(
		'[data-test="dhis2-uicore-menu"] > [data-test="dhis2-uicore-menulist"] > :nth-child(3) > a.jsx-2002348738',
	)
		.click()
		.wait(7000)
		.get(
			'[data-test="dhis2-uiwidgets-orgunittree-node-toggle"] > .jsx-3879512297',
		)
		.click()
		.wait(25000)
		.get(
			'.open > :nth-child(1) > [data-test="dhis2-uiwidgets-orgunittree-node-content"] > [data-test="dhis2-uiwidgets-orgunittree-node-label"] > div.jsx-1077964942 > .jsx-1077964942 > .jsx-4233103558 > div',
		)
		.click();
});

Then("the user selects the periods options", () => {
	cy.get(
		'[data-test="dhis2-uicore-menu"] > [data-test="dhis2-uicore-menulist"] > :nth-child(2) > a.jsx-2002348738',
	)
		.click()
		.wait(3000)
		.get('[data-test="LAST_180_DAYS-option"]')
		.dblclick()
		.get(
			'.jsx-3079864901 > [data-test="dhis2-uicore-centeredcontent"] > .jsx-498096601 > [data-test="dhis2-uicore-modal"] > [data-test="dhis2-uicore-card"] > .jsx-1532202667 > [data-test="dhis2-uicore-modalactions"] > [data-test="dhis2-uicore-buttonstrip"] > :nth-child(2) > [data-test="modal-update-button"]',
		)
		.click();
});

Then("the report should be visible", () => {
	cy.get('[data-test="dhis2-uicore-datatable"]').should("be.visible");
});

Then(/^the user selects download option "([^"]*)"$/, (option: string) => {
	cy.getWithDataTest(`{${option}}`).click();
});

Then("the user adds the dashboard to the list button", () => {
	cy.get(
		'[style="display: flex; gap: 16px; align-items: end; margin-bottom: 16px;"] > :nth-child(3) > [data-test="dhis2-uicore-button"]',
	).click();
});

Then("the added dashboard should be visible", () => {
	cy.get(
		':nth-child(6) > [data-test="dhis2-uicore-box"] > [data-test="dhis2-uicore-card"]',
	).should("be.visible");
});
