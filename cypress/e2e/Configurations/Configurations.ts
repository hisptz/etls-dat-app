import { Then, When } from "@badeball/cypress-cucumber-preprocessor";

When(/^the user clicks on the "([^"]*)" tab$/, function (tab: string) {
	const sanitizedTab = tab.replaceAll(" ", "-");
	cy.getWithDataTest(`{${sanitizedTab}-tab-item}`).click();
});

Then(/^inputs the device as "([^"]*)"$/, function (device: string) {
	cy.get(
		':nth-child(3) > [data-test="dhis2-uicore-centeredcontent"] > .jsx-498096601 > [data-test="dhis2-uicore-modal"] > [data-test="dhis2-uicore-card"] > .jsx-1532202667 > [data-test="dhis2-uicore-modalcontent"] > [style="height: 300px;"] > :nth-child(2) > [data-test="dhis2-uiwidgets-inputfield"] > [data-test="dhis2-uiwidgets-inputfield-content"] > [data-test="dhis2-uicore-box"] > [data-test="dhis2-uicore-input"] > #deviceEMInumber',
	)
		.click()
		.clear()
		.type(device);
});

Then(/^edits the device as "([^"]*)"$/, function (device: string) {
	cy.get(
		':nth-child(3) > [data-test="dhis2-uicore-centeredcontent"] > .jsx-498096601 > [data-test="dhis2-uicore-modal"] > [data-test="dhis2-uicore-card"] > .jsx-1532202667 > [data-test="dhis2-uicore-modalcontent"] > [style="height: 300px;"] > :nth-child(1) > [data-test="dhis2-uiwidgets-inputfield"] > [data-test="dhis2-uiwidgets-inputfield-content"] > [data-test="dhis2-uicore-box"] > [data-test="dhis2-uicore-input"] > #deviceEMInumber',
	)

		.click()
		.clear()
		.type(device);
});

Then(/^the user saves the device$/, function () {
	cy.get(
		':nth-child(3) > [data-test="dhis2-uicore-centeredcontent"] > .jsx-498096601 > [data-test="dhis2-uicore-modal"] > [data-test="dhis2-uicore-card"] > .jsx-1532202667 > [data-test="dhis2-uicore-modalactions"] > [data-test="dhis2-uicore-buttonstrip"] > :nth-child(2) > [data-test="dhis2-uicore-button"]',
	).click();
});

Then("the devices list should be updated succesfully", function () {
	cy.get('[data-test="dhis2-uicore-alertbar"]').should("be.visible");
});

Then("the user clicks on the Edit icon", function () {
	cy.get(
		':nth-child(9) > :nth-child(3) > div > [data-test="undefined-Edit"] > a.jsx-2002348738 > .icon',
	).click();
});

Then("the user clicks on the Delete icon", function () {
	cy.get(
		':nth-child(50) > :nth-child(3) > div > [data-test="undefined-Delete"] > a.jsx-2002348738 > .icon',
	).click();
});

When(/^the user clicks on the "([^"]*)" tab$/, function (tab: string) {
	const sanitizedTab = tab.replaceAll(" ", "-");
	cy.getWithDataTest(`{${sanitizedTab}-tab-item}`).click();
});

Then(/^the "([^"]*)" settings should be visible$/, function (tab: string) {
	const sanitizedTab = tab.replaceAll(" ", "-");
	cy.getWithDataTest(`{${sanitizedTab}-container}`);
});
When(
	/^the user adds "([^"]*)" to the selected list$/,
	function (country: string) {
		cy.getWithDataTest("{transfer-sourceoptions}").within(() => {
			cy.get('[data-test="dhis2-uicore-transferoption"]')
				.contains(`${country}`)
				.dblclick();
		});
	},
);

Then(/^a message "([^"]*)" should appear$/, function (message: string) {
	cy.get('[data-test="dhis2-uicore-alertstack"]').within(() => {
		cy.contains(`${message}`).should("be.visible");
	});
});
Then(
	/^the country "([^"]*)" should be in the selected list$/,
	function (country: string) {
		cy.getWithDataTest("{transfer-pickedoptions}").within(() => {
			cy.get('[data-test="dhis2-uicore-transferoption"]')
				.contains(`${country}`)
				.should("be.visible");
		});
	},
);
When(
	/^the user removes "([^"]*)" from selected list$/,
	function (country: string) {
		cy.wait(4000);
		cy.getWithDataTest("{transfer-pickedoptions}").within(() => {
			cy.get('[data-test="dhis2-uicore-transferoption"]')
				.contains(`${country}`)
				.dblclick();
		});
	},
);
Then(
	/^the country "([^"]*)" should not be in the selected list$/,
	function (country: string) {
		cy.getWithDataTest("{transfer-pickedoptions}").within(() => {
			cy.get('[data-test="dhis2-uicore-transferoption"]')
				.contains(`${country}`)
				.should("not.exist");
		});
		cy.getWithDataTest("{transfer-sourceoptions}").within(() => {
			cy.get('[data-test="dhis2-uicore-transferoption"]')
				.contains(`${country}`)
				.should("be.visible");
		});
	},
);

Then(
	/^a disease with the name "([^"]*)" should be in the list$/,
	function (value: string) {
		cy.get("td").contains(value).should("be.visible");
	},
);
When(
	/^the user select the disease "([^"]*)" from list$/,
	function (value: string) {
		cy.get("td").contains(value).click();
	},
);
Then(
	/^a details area with the details for "([^"]*)" disease should be visible$/,
	function (value: string) {
		cy.getWithDataTest("{details-card}").should("be.visible");
		cy.getWithDataTest("{details-header}").should("be.visible");
	},
);
When(
	/^the user clicks on the "([^"]*)" button on the details page$/,
	function (buttonName: string) {
		cy.getWithDataTest("{details-card}").within(() => {
			cy.get("button").contains(buttonName).click();
		});
	},
);
Then(
	/^a disease with the name "([^"]*)" should not be in the list$/,
	function (value: string) {
		cy.get("td").contains(value).should("not.exist");
	},
);
When(
	/^changes the "([^"]*)" to "([^"]*)"$/,
	function (fieldName: string, value: string) {
		cy.get(`input[name='${fieldName}']`).type(value);
	},
);
Then(/^the entity should be "([^"]*)" in the list$/, function (test: string) {
	cy.get("td").contains(test).should("not.exist");
});
Then(
	/^the document upload config with name "([^"]*)" should be in the list$/,
	function (name: string) {
		cy.getWithDataTest("{documents-upload-table}").within(() => {
			cy.get("tbody").within(() => {
				cy.get("tr")
					.contains(name)
					.scrollIntoView()
					.should("be.visible");
			});
		});
	},
);
Then(
	/^the user should delete the document upload configuration$/,
	function () {},
);
When(
	/^the user clicks on the "([^"]*)" in the action button of "([^"]*)" row$/,
	function (actionName: string, rowName: string) {
		cy.get("td")
			.contains(rowName)
			.parent()
			.within(() => {
				cy.get("button").click();
			});
		cy.get("a").contains(actionName).click();
	},
);
