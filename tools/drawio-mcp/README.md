# Draw.io MCP Generator

Переиспользуемый **инструмент** (MCP + CLI) для генерации `.drawio`.

**Конвенции и формат spec:** [CONVENTIONS.md](CONVENTIONS.md)

## Быстрый старт

```bash
cd tools/drawio-mcp
npm install
```

hw-2: `.drawio` для сдачи в `diagrams/drawio/`; specs в `diagrams/_dev/specs/` (frozen — не перезаписывать).

## Разделение ответственности

| Что | Где |
|-----|-----|
| **Tool** | `tools/drawio-mcp/` |
| **Спеки** | `{hwId}/diagrams/_dev/specs/` (legacy: `drawio/specs/`) |
| **Сдача** | `{hwId}/diagrams/drawio/*.drawio` |

## MCP в Cursor

[`.cursor/mcp.json`](../../.cursor/mcp.json) — сервер **drawio-generator**.

| Tool | Назначение |
|------|------------|
| `generate_drawio` | Один файл из inline spec или `specPath` |
| `generate_hw_diagrams` | Пакет по manifest (пропускает `frozen`) |
| `list_hw_diagram_bundles` | Список hw-пакетов |
| `get_drawio_spec_schema` | Справка по JSON spec |

## Новое ДЗ (hw-3)

1. `hw-3/diagrams/_dev/specs/manifest.json` + JSON-спеки.
2. Черновик: `node src/cli.mjs --hw hw-3`
3. Финал в diagrams.net → добавить в `frozen`.

Подробности — [CONVENTIONS.md](CONVENTIONS.md).
