#!/usr/bin/env node
/**
 * hw-3 dev helper — specs in _dev/specs, submission *.drawio in ../diagrams/.
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, "..", "..", "..");
const CLI = join(REPO_ROOT, "tools", "drawio-mcp", "src", "cli.mjs");

const result = spawnSync(process.execPath, [CLI, "--hw", "hw-3"], {
  cwd: REPO_ROOT,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
