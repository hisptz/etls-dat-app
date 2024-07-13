/// <reference types="cypress" />
import { enableAutoLogin } from "./enableAutoLogin";
import { enableNetworkShim } from "@dhis2/cypress-commands";

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Cypress {
		interface Chainable {
			/**
			 * A custom command to log in a user to DHIS2 before opening the app to test.
			 * @example cy.loginByApi({username: "admin", password: "district", baseUrl: "http://localhost:8080"})
			 */
			loginByApi(credentials: {
				username: string;
				password: string;
				baseUrl: string;
			}): void;

			/**
			 * Validates if a user is logged in
			 * */
			validateUserIsLoggedIn(credentials: {
				username: string;
				baseUrl: string;
			}): void;

			getWithDataTest(dataTest: string): Chainable<any>;
			findWithDataTest(dataTest: string): Chainable<any>;
		}
	}
}

//enableAutoLogin();
enableNetworkShim();
