import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const clientPath = path.join(rootDir, "scripts", "web_game_playwright_client.js");
const indexUrl = pathToFileURL(path.join(rootDir, "index.html")).href;
const outputBase = path.join(rootDir, "output", "web-game", "scenario-assertions");

function runPlaywrightScenario(name, actionsFile, outputDir) {
  const args = [
    clientPath,
    "--url",
    indexUrl,
    "--actions-file",
    actionsFile,
    "--iterations",
    "1",
    "--pause-ms",
    "100",
    "--screenshot-dir",
    outputDir,
  ];
  const result = spawnSync(process.execPath, args, {
    cwd: rootDir,
    stdio: "inherit",
    windowsHide: true,
  });
  if (result.status !== 0) {
    throw new Error(`Playwright scenario failed: ${name}`);
  }
}

function parseStateFile(outputDir) {
  const statePath = path.join(outputDir, "state-0.json");
  if (!fs.existsSync(statePath)) {
    throw new Error(`Missing scenario state file: ${statePath}`);
  }
  return JSON.parse(fs.readFileSync(statePath, "utf8"));
}

function readErrors(outputDir) {
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

function findTeamPet(state, slot) {
  const entry = Array.isArray(state.team) ? state.team.find((row) => row.slot === slot) : null;
  return entry?.pet ?? null;
}

function includesLog(state, text) {
  const log = state?.battle?.logTop;
  if (!Array.isArray(log)) return false;
  return log.some((line) => typeof line === "string" && line.includes(text));
}

function includesResolved(state, text) {
  const entries = state?.battle?.triggerResolved;
  if (!Array.isArray(entries)) return false;
  return entries.some((line) => typeof line === "string" && line.includes(text));
}

const scenarios = [
  {
    name: "choco",
    actionsFile: path.join(rootDir, "test", "actions-scenario-choco.json"),
    validate: (state, failures) => {
      if (state.mode !== "shop") failures.push(`expected mode=shop, got ${state.mode}`);
      const fish = findTeamPet(state, 0);
      if (!fish || fish.kind !== "fish") failures.push("expected slot0 fish");
      if (!fish || fish.level !== 2) failures.push(`expected slot0 fish level=2, got ${fish?.level ?? "null"}`);
      if (state.gold !== 7) failures.push(`expected gold=7 after chocolate, got ${state.gold}`);
    },
  },
  {
    name: "melon",
    actionsFile: path.join(rootDir, "test", "actions-scenario-melon.json"),
    validate: (state, failures) => {
      if (state.mode !== "battle") failures.push(`expected mode=battle, got ${state.mode}`);
      if (state?.battle?.result !== "win") failures.push(`expected battle result=win, got ${state?.battle?.result}`);
      if (!includesLog(state, "Melon blocks the hit")) failures.push("expected melon block log entry");
      const front = state?.battle?.friendly?.[0] ?? null;
      if (front && front.perk !== null) failures.push(`expected front perk consumed, got ${front.perk}`);
    },
  },
  {
    name: "dodo",
    actionsFile: path.join(rootDir, "test", "actions-scenario-dodo.json"),
    validate: (state, failures) => {
      if (state.mode !== "battle") failures.push(`expected mode=battle, got ${state.mode}`);
      if (!includesLog(state, "Dodo buffs Fish")) failures.push("expected dodo start-battle buff log entry");
      if (!includesResolved(state, "start:Friendly:Dodo")) failures.push("expected resolved start trigger for friendly dodo");
    },
  },
  {
    name: "peng",
    actionsFile: path.join(rootDir, "test", "actions-scenario-peng.json"),
    validate: (state, failures) => {
      if (state.mode !== "battle") failures.push(`expected mode=battle, got ${state.mode}`);
      if (state?.battle?.result !== "win") failures.push(`expected battle result=win, got ${state?.battle?.result}`);
      const fish = findTeamPet(state, 0);
      if (!fish || fish.kind !== "fish") failures.push("expected slot0 fish");
      if (!fish || fish.attack !== 5 || fish.health !== 6) {
        failures.push(
          `expected slot0 fish post-penguin stats 5/6 before battle clone, got ${fish?.attack ?? "null"}/${fish?.health ?? "null"}`
        );
      }
    },
  },
  {
    name: "turtle",
    actionsFile: path.join(rootDir, "test", "actions-scenario-turtle.json"),
    validate: (state, failures) => {
      if (state.mode !== "battle") failures.push(`expected mode=battle, got ${state.mode}`);
      if (state?.battle?.result !== "win") failures.push(`expected battle result=win, got ${state?.battle?.result}`);
      if (!includesLog(state, "Turtle gives Melon to Fish")) failures.push("expected turtle melon handoff log entry");
      if (!includesLog(state, "Melon blocks the hit")) failures.push("expected fish melon block after turtle handoff");
    },
  },
];

function parseOnlyScenarios() {
  const args = process.argv.slice(2);
  if (!args.length) return null;
  return new Set(args.map((name) => name.trim().toLowerCase()).filter(Boolean));
}

function main() {
  const only = parseOnlyScenarios();
  const selected = only ? scenarios.filter((scenario) => only.has(scenario.name)) : scenarios;
  if (!selected.length) {
    throw new Error("No valid scenario selected. Valid names: choco, melon, dodo, peng, turtle");
  }

  fs.mkdirSync(outputBase, { recursive: true });

  let failedCount = 0;
  for (const scenario of selected) {
    const scenarioOutput = path.join(outputBase, scenario.name);
    fs.rmSync(scenarioOutput, { recursive: true, force: true });
    fs.mkdirSync(scenarioOutput, { recursive: true });

    runPlaywrightScenario(scenario.name, scenario.actionsFile, scenarioOutput);

    const failures = [];
    const errors = readErrors(scenarioOutput);
    if (errors.length) {
      failures.push(`playwright captured errors (${errors.length})`);
    }

    const state = parseStateFile(scenarioOutput);
    scenario.validate(state, failures);

    if (failures.length) {
      failedCount += 1;
      console.error(`\n[FAIL] ${scenario.name}`);
      for (const failure of failures) console.error(`  - ${failure}`);
      continue;
    }

    console.log(`[PASS] ${scenario.name}`);
  }

  if (failedCount > 0) {
    throw new Error(`Scenario assertions failed: ${failedCount}`);
  }

  console.log(`\nScenario assertions passed (${selected.length}/${selected.length}).`);
}

main();
