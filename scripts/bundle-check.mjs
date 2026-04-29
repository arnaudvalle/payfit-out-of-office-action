/**
 * This script replicates what GitHub Actions does when running a workflow:
 *
 * - builds the action with esbuild (`npm run package`)
 * - runs dist/index.js with environment variables:
 *   - NODE_ENV=test
 *   - INPUT_* 
 *   - GITHUB_OUTPUT (matches src/index.ts local-file path)
 */

import { execSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// Get the root of the repository
const repoRoot = join(fileURLToPath(new URL(".", import.meta.url)), "..");

process.chdir(repoRoot);

// Build the action (esbuild bundle)
execSync("npm run package", { stdio: "inherit", cwd: repoRoot });

// Create a temporary directory for the github output
const githubOutputDir = mkdtempSync(join(tmpdir(), "payfit-oof-bundle-check-"));
const githubOutputPath = join(githubOutputDir, "github_output");
// The real runner provides an empty file at this path; @actions/core errors if missing.
writeFileSync(githubOutputPath, "", { encoding: "utf8" });

// Get the path to the example calendar
const fixtureCalendar = join(
  repoRoot,
  "__tests__/__fixtures__/example-calendar-empty.ics",
);

// Set the environment variables for the action
const env = {
  ...process.env,
  NODE_ENV: "test",
  INPUT_CALENDAR_URL: fixtureCalendar,
  INPUT_NAMES: "Geralt OF RIVIA",
  GITHUB_OUTPUT: githubOutputPath,
};

// Run the action
const result = spawnSync(process.execPath, ["dist/index.js"], {
  cwd: repoRoot,
  env,
  encoding: "utf8",
});

if (result.stderr) {
  process.stderr.write(result.stderr);
}
if (result.stdout) {
  process.stdout.write(result.stdout);
}

// Check if the action exited with an error
if (result.status !== 0 || result.error) {
  console.error(
    result.error ??
      new Error(`dist/index.js exited with code ${result.status ?? "unknown"}`),
  );
  process.exit(result.status ?? 1);
}


// Read the github output
const written = readFileSync(githubOutputPath, "utf8");

// Check if the github output contains a names output
if (!written.includes("names")) {
  console.error(
    "Bundle check failed: GITHUB_OUTPUT did not contain a names output.",
    `\n---\n${written}\n---`,
  );
  process.exit(1);
}

console.log("Bundle check OK: packaged dist runs with fixture inputs.");
