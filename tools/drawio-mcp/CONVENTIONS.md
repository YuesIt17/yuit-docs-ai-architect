# Draw.io MCP — Conventions

Conventions for the `tools/drawio-mcp` generator and JSON specs in the assignments.

## Artifact Roles

| Artifact | Where | Source of truth |
|----------|-----|-----------------|
| **Tool** (MCP, CLI, builder) | `tools/drawio-mcp/` | Generator code |
| **JSON spec** | `{hwId}/diagrams/_dev/specs/*.json` | Snapshot/layout for regeneration and MCP |
| **`.drawio`** | `{hwId}/diagrams/drawio/*.drawio` | **Final submission**; after manual editing, the main artifact |
| **`manifest.json`** | `{hwId}/diagrams/_dev/specs/` | `frozen` list + optional auto-generation |

### hw-2: All Diagrams Are Frozen

After manual formatting in diagrams.net, **do not regenerate** the `.drawio` through CLI/MCP — only edit the file in the editor. Specs are kept in sync with the diagrams as **layout documentation**, not as a mandatory build pipeline.

## Spec Structure (C4)

```json
{
  "title": "C2 Containers",
  "pageWidth": 1240,
  "pageHeight": 620,
  "nodes": [
    {
      "id": "fe",
      "label": "Frontend\nWeb, iOS, Android",
      "style": "container",
      "x": 40,
      "y": 88,
      "w": 160,
      "h": 79,
      "parent": "boundary"
    }
  ],
  "edges": [
    {
      "from": "fe",
      "to": "be",
      "label": "REST",
      "parent": "boundary",
      "exitX": 1,
      "exitY": 0.5,
      "entryX": 0,
      "entryY": 0.5,
      "waypoints": [{ "x": 335, "y": 167 }],
      "labelOffset": { "x": 0, "y": -12 }
    }
  ]
}
```

### Node Styles (`style`)

| Value | C4 / Draw.io | Color |
|----------|--------------|------|
| `person` | UML Actor | blue |
| `system` | System (C1) | blue block |
| `container` | Container (C2) | blue block |
| `component` | Component (C3) | light blue block |
| `external` | External system | gray |
| `db` | DB cylinder | blue |
| `boundary` | Dashed frame | no fill |
| `note` | Note (Sequence) | yellow |

### Coordinates

- **`x`, `y`, `w`, `h`** — in pixels, Draw.io grid of 10 px.
- **Without `parent`** — coordinates are **absolute** (from the page).
- **With `parent: "boundary"`** — coordinates are **relative** to the parent frame (as in Draw.io).
- After manual editing, round to integers; fractions from Draw.io (e.g. `79.2`) become `79` in the spec.

### Labels

- Line break in JSON: `\n` → becomes `&#10;` in XML.
- **Do not use** `<br>` in a spec — it breaks the XML.

## Edge Routing

| Field | Range | Purpose |
|------|----------|------------|
| `exitX`, `exitY` | 0–1 | Exit point on the source side |
| `entryX`, `entryY` | 0–1 | Entry point on the target side |
| `waypoints` | `[{x,y}, …]` | "Elbow" of an orthogonal arrow |
| `labelOffset` | `{x,y}` | Label offset from the line |
| `parent` | boundary id | The edge is drawn inside the frame (C2/C3) |

### Layout Rules (RetailPartnerX)

1. **Horizontal links** — label **above** the line: `labelOffset: { "y": -12 }`.
2. **Vertical links** (to a DB) — label **to the side**: `labelOffset: { "x": ±10–12, "y": 0 }`.
3. **Long labels** — increase the gap between blocks (`x`), do not shorten the meaning unless necessary.
4. **Return arrows** (Response, JSON response) — route **over the top** or **on the left** via `waypoints`, not through block centers.
5. **External systems** (PIM) — enough clearance from the boundary; `waypoints` if needed.
6. **`labelBackgroundColor`** — a white label background is included in the generator's edge style.

### Generator Limitations

- Not all Draw.io edge constructs (floating `targetPoint`, `mxGeometry x=` as a fraction) export 1:1 — complex edits stay in the `.drawio`.
- Sequence: only a uniform participant grid; fine tuning is done in the editor.

## Sequence spec

```json
{
  "title": "Sequence get recommendation",
  "pageWidth": 1430,
  "pageHeight": 1026,
  "sequence": {
    "colWidth": 130,
    "boxWidth": 108,
    "startX": 50,
    "headerY": 30,
    "msgY0": 130,
    "msgStep": 48,
    "participants": [ … ],
    "messages": [ … ],
    "notes": [{ "afterMessage": 2, "label": "…", "w": 200, "h": 50 }]
  }
}
```

- `from` / `to` — participant index (0-based) or `id`.
- `"return": true` — dashed return arrow.

## Manifest

```json
{
  "hwId": "hw-2",
  "frozen": ["c1-context.drawio", "…"],
  "diagrams": []
}
```

| Field | Meaning |
|------|--------|
| `frozen` | Files that are **not overwritten** by `generate_hw_diagrams` |
| `diagrams` | `{ spec, output }` pairs for auto-generation (empty = manual `.drawio` only) |

## Workflow

### New Diagram (hw-3+)

1. Write a JSON spec (or inline via MCP `generate_drawio`).
2. Generate a draft `.drawio`.
3. Finish it in diagrams.net.
4. **Sync the spec** with the final coordinates (optional, for reuse).
5. Add it to `frozen` after acceptance.

### Editing a Frozen Diagram (hw-2)

1. Edit **only** the `.drawio`.
2. If desired, update the spec "for history" — carry the coordinates from Draw.io to JSON **without** regeneration.

## CLI / MCP

```bash
# One file (do not overwrite frozen without an explicit output)
node src/cli.mjs --spec hw-2/diagrams/_dev/specs/c1-context.json \
  --output /tmp/preview.drawio

# Batch by manifest (hw-2: diagrams is empty — does nothing)
node src/cli.mjs --hw hw-2
```

MCP tools: `generate_drawio`, `generate_hw_diagrams`, `export_drawio_png`, `list_hw_diagram_bundles`, `get_drawio_spec_schema`.

## File Naming

| Level | Spec | Draw.io |
|---------|------|---------|
| C1 | `c1-context.json` | `c1-context.drawio` |
| C2 | `c2-containers.json` | `c2-containers.drawio` |
| C3 recsys | `c3-ai-service-recsys.json` | `c3-ai-service-recsys.drawio` |
| C3 RAG (template) | `_dev/templates/c3-ai-service-rag-future.json` | not submitted |
| Sequence | `sequence-get-recommendation.json` | `sequence-get-recommendation.drawio` |

## Link to C4 hw-2

- **C3 recsys** + **Sequence** + **OpenAPI** — one MVP chain (component names match).

See [hw-2/diagrams/README.md](../../hw-2/diagrams/README.md).
