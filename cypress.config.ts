import {defineConfig} from "cypress";
import {chromeAllowXSiteCookies, networkShim} from "@dhis2/cypress-plugins";
import path from "path";

async function cucumberPreprocessor(on: any, config: any) {
  const preprocessor = require("@badeball/cypress-cucumber-preprocessor");
  const webpack = require("@cypress/webpack-preprocessor");
  // This is required for the preprocessor to be able to generate JSON reports after each run, and more,
  await preprocessor.addCucumberPreprocessorPlugin(on, config);

  on(
      "file:preprocessor",
      webpack({
        webpackOptions: {
          context: path.resolve(__dirname, "cypress"),
          resolve: {
            extensions: [".ts", ".js"],
          },
          module: {
            rules: [
              {
                test: /\.ts$/,
                exclude: [/node_modules/],
                use: [
                  {
                    loader: "ts-loader",
                    options: {
                      transpileOnly: true
                    }
                  },
                ],
              },
              {
                test: /\.feature$/,
                use: [
                  {
                    loader: "@badeball/cypress-cucumber-preprocessor/webpack",
                    options: config,
                  },
                ],
              },
            ],
          },
        },
      })
  );
}

async function setupNodeEvents(on: any, config: any) {
  chromeAllowXSiteCookies(on, config);
  await cucumberPreprocessor(on, config);
  networkShim(on, config);
  return config;
}

export default defineConfig({
  e2e: {
    viewportWidth: 1368,
    viewportHeight: 768,
    setupNodeEvents,
    defaultCommandTimeout: 20000,
    requestTimeout: 20000,
    responseTimeout: 20000,
    retries: 2,
    taskTimeout: 20000,
    pageLoadTimeout: 10000,
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.feature",
    env: {
      dhis2DataTestPrefix: "d2-poe",
      networkMode: "live",
      dhis2ApiVersion: 40,
    },
    experimentalInteractiveRunEvents: true,
    experimentalStudio: true
  },
});
