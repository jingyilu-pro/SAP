import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const testDir = path.join(rootDir, "test");
const clientPath = path.join(rootDir, "scripts", "web_game_playwright_client.js");
const scenarioAssertionPath = path.join(rootDir, "scripts", "run_scenario_assertions.mjs");
const indexUrl = pathToFileURL(path.join(rootDir, "index.html")).href;
const outputBase = path.join(rootDir, "output", "web-game", "full-regression");

function readActionFiles() {
  const names = fs
    .readdirSync(testDir)
    .filter((name) => /^actions-.*\.json$/i.test(name))
    .filter((name) => !/^actions-scenario-.*\.json$/i.test(name))
    .sort((a, b) => a.localeCompare(b));
  return names.map((name) => path.join(testDir, name));
}

function parseErrorArtifacts(outputDir) {
  const errorsPath = path.join(outputDir, "errors-0.json");
  if (!fs.existsSync(errorsPath)) return [];
  const text = fs.readFileSync(errorsPath, "utf8").trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [{ type: "parse_error", text }];
  }
}

function runNodeScript(scriptPath, args, label) {
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: rootDir,
    stdio: "inherit",
    windowsHide: true,
  });
  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status ?? "unknown"}`);
  }
}

function runActionRegression(actionFile, outputDir) {
  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });

  const args = [
    clientPath,
    "--url",
    indexUrl,
    "--actions-file",
    actionFile,
    "--iterations",
    "1",
    "--pause-ms",
    "120",
    "--screenshot-dir",
    outputDir,
  ];

  const result = spawnSync(process.execPath, args, {
    cwd: rootDir,
    stdio: "inherit",
    windowsHide: true,
  });
  if (result.status !== 0) {
    throw new Error(`Playwright regression failed for ${path.basename(actionFile)} (exit ${result.status ?? "unknown"})`);
  }

  const errors = parseErrorArtifacts(outputDir);
  if (errors.length) {
    throw new Error(`Regression produced console/page errors for ${path.basename(actionFile)} (${errors.length})`);
  }
}

function parseOnlyActions() {
  const names = process.argv.slice(2).map((name) => name.trim()).filter(Boolean);
  if (!names.length) return null;
  return new Set(names.map((name) => name.toLowerCase()));
}

function main() {
  const only = parseOnlyActions();
  const actionFiles = readActionFiles();
  if (!actionFiles.length) {
    throw new Error("No non-scenario action files found under ./test.");
  }

  const selectedActions = only
    ? actionFiles.filter((actionFile) => only.has(path.basename(actionFile).toLowerCase()))
    : actionFiles;

  if (!selectedActions.length) {
    throw new Error("No action files matched filter args. Pass full filenames like actions-smoke.json");
  }

  fs.mkdirSync(outputBase, { recursive: true });

  console.log("Running scenario assertions...");
  runNodeScript(scenarioAssertionPath, [], "scenario assertions");
  console.log("Scenario assertions complete.\n");

  let passCount = 0;
  for (const actionFile of selectedActions) {
    const base = path.basename(actionFile, ".json");
    const outputDir = path.join(outputBase, base);
    runActionRegression(actionFile, outputDir);
    passCount += 1;
    console.log(`[PASS] ${path.basename(actionFile)}`);
  }

  console.log(`\nFull regression passed (${passCount} action files + scenario assertions).`);
}

main();
