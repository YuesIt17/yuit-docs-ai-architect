# Draw.io MCP Generator

A reusable **tool** (MCP + CLI) for generating `.drawio` files.

**Conventions and spec format:** [CONVENTIONS.md](CONVENTIONS.md)

## Quick Start

```bash
cd tools/drawio-mcp
npm install
```

hw-2: the submission `.drawio` files are in `diagrams/drawio/`; specs are in `diagrams/_dev/specs/` (frozen — do not overwrite).

## Separation of Responsibilities

| What | Where |
|-----|-----|
| **Tool** | `tools/drawio-mcp/` |
| **Specs** | `{hwId}/diagrams/_dev/specs/` (legacy: `drawio/specs/`) |
| **Submission** | `{hwId}/diagrams/drawio/*.drawio` |

## MCP in Cursor

[`.cursor/mcp.json`](../../.cursor/mcp.json) — the **drawio-generator** server.

| Tool | Purpose |
|------|------------|
| `generate_drawio` | One file from an inline spec or `specPath` |
| `generate_hw_diagrams` | Batch by manifest (skips `frozen`) |
| `export_drawio_png` | Export `.drawio` → PNG (cloud API + fallback from the JSON spec) |
| `list_hw_diagram_bundles` | List of hw bundles |
| `get_drawio_spec_schema` | JSON spec reference |

## New Assignment (hw-3)

1. `hw-3/diagrams/_dev/specs/manifest.json` + JSON specs.
2. Draft: `node src/cli.mjs --hw hw-3`
3. PNG for submission: `node src/cli.mjs --export-png hw-3/diagrams/multi-agent-architecture.drawio`
4. Finish in diagrams.net → add to `frozen`.

Details — [CONVENTIONS.md](CONVENTIONS.md).
