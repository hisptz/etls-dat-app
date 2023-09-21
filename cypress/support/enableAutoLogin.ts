import {isStubMode} from "@dhis2/cypress-commands";

Cypress.Commands.add("validateUserIsLoggedIn", ({baseUrl, username}: { baseUrl: string; username: string }) => {
	cy.request(`${baseUrl}/api/me`).then((response) => {
		expect(response.status).to.eq(200);
	});
});

export const enableAutoLogin = () => {
	if (isStubMode()) {
		return;
	}

	const username = Cypress.env("dhis2Username");
	const password = Cypress.env("dhis2Password");
	const baseUrl = Cypress.env("dhis2BaseUrl");

	const createSession = () =>
		cy.session(
			"user",
			() => {
				// Not using the login form to log in as that's the
				// recommendation by cypress:
				// * https://docs.cypress.io/guides/end-to-end-testing/testing-your-app#Fully-test-the-login-flow----but-only-once
				// * https://docs.cypress.io/api/commands/session#Multiple-login-commands
				cy.loginByApi({username, password, baseUrl});
			},
			{
				cacheAcrossSpecs: true,
				validate: () => {
					cy.validateUserIsLoggedIn({baseUrl, username});
				},
			}
		);

	before(() => {
		/*
				 * At the very start of a capture run the server version
				 * is evaluated. This is done by querying the `system/info`
				 * endpoint which requires authentication. So if there is no
				 * valid session at the start of the run, we'd better log in.
				 */
		cy.getCookie("JSESSIONID").then((cookie) => {
			if (!cookie) {
				createSession();
			}
		});
	});
	beforeEach(() => {
		createSession();
	});
};
