# hw-3 Diagrams — RetailPartnerX Shopping Assistant

Case: [hw-1](../../hw-1/RetailPartnerX_AI_Strategy.md) · [hw-2](../hw-2/diagrams/README.md)

## Submission Artifacts

| Artifact | File | Purpose |
|----------|------|------------|
| Multi-Agent Architecture | [multi-agent-architecture.png](multi-agent-architecture.png) | **Main submission diagram** — agents, RAG, Vector DB |
| Multi-Agent (editable) | [multi-agent-architecture.drawio](multi-agent-architecture.drawio) | Draw.io source |
| Sequence | [sequence-shopping-assistant.png](sequence-shopping-assistant.png) | Happy path: request → cart |
| Sequence (editable) | [sequence-shopping-assistant.drawio](sequence-shopping-assistant.drawio) | Draw.io source |

## Key Elements on the Diagram

- The **Orchestrator** delegates to specialists (it does not search the catalog itself).
- **Policy KB** → offline ingestion → **Vector DB / policies** → Policy Analyst (RAG).
- **Basket Assembler** → `get_recommendation` (link to the hw-2 API).

## PNG Export

```bash
# Via the CLI (cloud API → fallback SVG from the spec + sharp)
node tools/drawio-mcp/src/cli.mjs --export-png hw-3/diagrams/multi-agent-architecture.drawio

# Or the MCP tool export_drawio_png
```

If `convert.diagrams.net` returns an empty response, the JSON spec from `diagrams/_dev/specs/` is used (same basename as the `.drawio`).

## Regenerating from JSON

```bash
node tools/drawio-mcp/src/cli.mjs --hw hw-3
node tools/drawio-mcp/src/cli.mjs --export-png hw-3/diagrams/multi-agent-architecture.drawio
```

Specs: [_dev/specs/](_dev/specs/). MCP: `generate_hw_diagrams`, `export_drawio_png`.
