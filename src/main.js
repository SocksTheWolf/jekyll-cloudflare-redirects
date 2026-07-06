import * as core from '@actions/core'
import { readFile, appendFile, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * The main function for the action.
 *
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run() {
  try {
    // get the base
    const outputPath = resolve("./", core.getInput("outputPath"));
    // redirects.json is hardcoded as the output file from Jekyll
    const redirectPath = resolve(outputPath, "redirects.json");
    if (!existsSync(redirectPath)) {
      core.warning("REDIRECT FILE DOES NOT EXIST! Check the runtime order, this action should run after a Jekyll build");
      core.setOutput("success", false);
      return;
    }
    const redirConfig = await readFile(redirectPath);
    const redirObject = JSON.parse(redirConfig);
    const numRules = Object.keys(redirObject).length;

    core.info(`Attempting to create ${numRules} rules...`);
    // create the redirect rules
    let redirectRules = new Array(numRules);
    for (let [key, value] of Object.entries(redirObject)) {
      redirectRules.push(`${key} ${value}`);
    }

    const outputFile = resolve(outputPath, "_redirects");
    // Check to see if we have a _redirects file, we will always append to it
    await appendFile(outputFile, redirectRules.join("\n"));

    // Set outputs for other workflow steps to use
    core.setOutput("success", true);
    core.notice("Redirect file successfully written!");
  } catch (error) {
    core.setOutput("success", false);
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
