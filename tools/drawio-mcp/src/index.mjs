#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  generateFromManifest,
  generateFromSpec,
  getHwSpecsDir,
  listAvailableHwIds,
  loadManifest,
} from "./generate.mjs";
import { SPEC_SCHEMA_HELP } from "./render-spec.mjs";

const server = new McpServer({
  name: "drawio-generator",
  version: "1.0.0",
});

server.tool(
  "generate_drawio",
  "Generate one Draw.io (.drawio) file from a JSON diagram spec. Use nodes+edges for C4 or sequence for Sequence diagrams.",
  {
    outputPath: z
      .string()
      .describe("Output .drawio path (relative to repo root or absolute)"),
    spec: z
      .any()
      .optional()
      .describe("Inline diagram spec object (see get_drawio_spec_schema)"),
    specPath: z
      .string()
      .optional()
      .describe("Spec file path relative to repo root, e.g. hw-2/diagrams/_dev/specs/c1-context.json"),
  },
  async ({ outputPath, spec, specPath }) => {
    if (!spec && !specPath) {
      throw new Error("Provide either spec or specPath");
    }
    const result = generateFromSpec({ spec, specPath, outputPath });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
);

server.tool(
  "generate_hw_diagrams",
  "Generate all Draw.io diagrams for a homework bundle (manifest in <hwId>/diagrams/_dev/specs/)",
  {
    hwId: z.string().describe("Homework id, e.g. hw-2, hw-3"),
    outputDir: z
      .string()
      .optional()
      .describe("Override output directory (default from manifest)"),
  },
  async ({ hwId, outputDir }) => {
    const result = generateFromManifest({ hwId, outputDir });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
);

server.tool(
  "list_hw_diagram_bundles",
  "List available homework diagram bundles with manifest metadata",
  {},
  async () => {
    const hwIds = listAvailableHwIds();
    const bundles = hwIds.map((hwId) => {
      const manifest = loadManifest(hwId);
      return {
        hwId,
        specsDir: getHwSpecsDir(hwId),
        description: manifest.description,
        defaultOutputDir: manifest.defaultOutputDir,
        diagramCount: manifest.diagrams.length,
        diagrams: manifest.diagrams.map((d) => d.output),
      };
    });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(bundles, null, 2),
        },
      ],
    };
  },
);

server.tool(
  "get_drawio_spec_schema",
  "Return JSON schema help and examples for generate_drawio specs",
  {},
  async () => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(SPEC_SCHEMA_HELP, null, 2),
        },
      ],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
