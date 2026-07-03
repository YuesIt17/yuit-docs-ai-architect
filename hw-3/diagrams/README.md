# Диаграммы hw-3 — RetailPartnerX Shopping Assistant

Кейс: [hw-1](../../hw-1/RetailPartnerX_AI_Strategy.md) · [hw-2](../hw-2/diagrams/README.md)

## Артефакты для сдачи

| Артефакт | Файл | Назначение |
|----------|------|------------|
| Multi-Agent Architecture | [multi-agent-architecture.png](multi-agent-architecture.png) | **Основная схема сдачи** — агенты, RAG, Vector DB |
| Multi-Agent (редактируемый) | [multi-agent-architecture.drawio](multi-agent-architecture.drawio) | Исходник Draw.io |
| Sequence | [sequence-shopping-assistant.drawio](sequence-shopping-assistant.drawio) | Happy path: запрос → корзина |

## Ключевые элементы на схеме

- **Orchestrator** делегирует специалистам (не ищет в каталоге сам).
- **Policy KB** → offline ingestion → **Vector DB / policies** → Policy Analyst (RAG).
- **Basket Assembler** → `get_recommendation` (связь с hw-2 API).

## Экспорт PNG

```bash
# Через CLI (cloud API → fallback SVG из spec + sharp)
node tools/drawio-mcp/src/cli.mjs --export-png hw-3/diagrams/multi-agent-architecture.drawio

# Или MCP tool export_drawio_png
```

Если `convert.diagrams.net` вернёт пустой ответ, используется JSON spec из `diagrams/_dev/specs/` (тот же basename, что у `.drawio`).

## Перегенерация из JSON

```bash
node tools/drawio-mcp/src/cli.mjs --hw hw-3
node tools/drawio-mcp/src/cli.mjs --export-png hw-3/diagrams/multi-agent-architecture.drawio
```

Спеки: [_dev/specs/](_dev/specs/). MCP: `generate_hw_diagrams`, `export_drawio_png`.
