import {Then, When} from "@badeball/cypress-cucumber-preprocessor"

When(/^the user visits the app$/, function () {
		cy.visit('/');
});
Then(/^the words "([^"]*)" should be displayed$/, function (label: string) {
		cy.get('h1').contains(label);
});
