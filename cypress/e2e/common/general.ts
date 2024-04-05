import {When} from "@badeball/cypress-cucumber-preprocessor";

When(/^intercepts the "([^"]*)" api call as "([^"]*)"$/, function (endpoint: string, alias: string) {
	cy.intercept(`**/${endpoint}*`).as(alias);
});
