import { Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";

Given(/^an authorized user$/, function () {
	cy.visit("/");
});

When(/^the user clicks on the "([^"]*)" page$/, function (path: string) {
	cy.getWithDataTest(`{${path}-menu-item}`).click();
});
Then(
	/^the user should be navigated to the "([^"]*)" page$/,
	function (path: string) {
		cy.getWithDataTest(`{${path}-container}`).should("be.visible");
	},
);
Then(/^user waits for "([^"]*)" seconds$/, function (seconds: string) {
	cy.wait(parseInt(seconds) * 1000);
});
