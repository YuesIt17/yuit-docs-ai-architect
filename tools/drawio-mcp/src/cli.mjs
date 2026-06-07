#!/usr/bin/env node
import { generateFromManifest, generateFromSpec } from "./generate.mjs";

function usage() {
  console.log(`Usage:
  node src/cli.mjs --hw <hwId> [--output <dir>]
  node src/cli.mjs --spec <specPath> --output <file.drawio>

Examples:
  npm run generate:hw-2
  node src/cli.mjs --hw hw-2
  node src/cli.mjs --spec hw-2/diagrams/_dev/specs/c1-context.json --output hw-2/diagrams/drawio/c1-context.drawio
`);
}

function parseArgs(argv) {
  const args = { hw: null, output: null, spec: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--hw") {
      args.hw = argv[++i];
    } else if (arg === "--output") {
      args.output = argv[++i];
    } else if (arg === "--spec") {
      args.spec = argv[++i];
    } else if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

if (args.hw) {
  const result = generateFromManifest({ hwId: args.hw, outputDir: args.output });
  for (const item of result.diagrams) {
    console.log(`Wrote ${item.outputPath}`);
  }
  console.log(`Done: ${result.diagrams.length} diagrams -> ${result.outputDir}`);
  process.exit(0);
}

if (args.spec && args.output) {
  const result = generateFromSpec({ specPath: args.spec, outputPath: args.output });
  console.log(`Wrote ${result.outputPath}`);
  process.exit(0);
}

usage();
process.exit(1);
