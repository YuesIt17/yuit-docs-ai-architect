#!/usr/bin/env node
/**
 * hw-2 dev helper — specs in _dev/specs, submission *.drawio in ../drawio/.
 * Frozen files are not overwritten (see specs/manifest.json).
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const MCP_ROOT = join(HERE, "..", "..", "..", "tools", "drawio-mcp");
const CLI = join(MCP_ROOT, "src", "cli.mjs");

const result = spawnSync(process.execPath, [CLI, "--hw", "hw-2"], {
  cwd: join(HERE, "..", "..", ".."),
  stdio: "inherit",
});

process.exit(result.status ?? 1);
