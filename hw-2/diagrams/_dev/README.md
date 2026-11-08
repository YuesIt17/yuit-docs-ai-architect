# _dev — hw-2 Supporting Materials

**Not for submission.** Layout specs, the generator and templates live here.

| Path | Purpose |
|------|------------|
| [specs/](specs/) | JSON layout snapshots for Draw.io MCP |
| [templates/](templates/) | Educational RAG example from the assignment text |
| [generate_drawio.mjs](generate_drawio.mjs) | CLI wrapper (`--hw hw-2`; frozen does not overwrite the `.drawio`) |

Regenerating one file (from the repository root):

```bash
node tools/drawio-mcp/src/cli.mjs \
  --spec hw-2/diagrams/_dev/specs/c1-context.json \
  --output hw-2/diagrams/c1-context.drawio
```

Conventions: [tools/drawio-mcp/CONVENTIONS.md](../../../tools/drawio-mcp/CONVENTIONS.md).
