import * as core from '@actions/core'
import { readFile, appendFileSync, existsSync, unlink } from 'fs';
import { resolve } from 'path';

/**
 * The main function for the action.
 *
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run() {
  try {
    // Only set to true when we actually write
    core.setOutput("success", false);

    // get the base
    const outputPath = resolve("./", core.getInput("output_path"));
    // redirects.json is hardcoded as the output file from Jekyll
    const redirectPath = resolve(outputPath, "redirects.json");
    if (!existsSync(redirectPath)) {
      core.warning("REDIRECT FILE DOES NOT EXIST! Check the runtime order, this action should run after a Jekyll build");
      return;
    }
    // This path must be set exactly for Cloudflare
    const outputFile = resolve(outputPath, "_redirects");

    await readFile(redirectPath, async (err, data) => {
      if (err)
        throw Error(`Failed to read redirects.json file ${err}`);

      // Parse the json file
      const redirObject = JSON.parse(data);

      // Create the redirect rules
      core.info(`Attempting to create ${Object.keys(redirObject).length} rules...`);
      let redirectRules = new Array();
      for (let [key, value] of Object.entries(redirObject)) {
        redirectRules.push(`${key} ${value}`);
      }

      // Check to see if we have a _redirects file, we will always append to it
      core.debug("Writing the redirect rules...");
      const preamble = existsSync(outputFile) ? "\n" : "";
      appendFileSync(outputFile, preamble + redirectRules.join("\n"));

      // delete the original file, we don't need it anymore.
      if (core.getBooleanInput("delete_redirects_json"))
        await unlink(redirectPath, (err) => {});

      // Set outputs for other workflow steps to use
      core.setOutput("success", true);
      core.info("Redirect file successfully written!");
    });
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
