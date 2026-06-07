# Диаграммы hw-2 — RetailPartnerX

MVP: персональные рекомендации на **карточке товара**. Кейс: [RetailPartnerX_AI_Strategy.md](../hw-1/RetailPartnerX_AI_Strategy.md) · термины: [Glossary.md](../Glossary.md).

## Для сдачи

| Артефакт | Путь |
|----------|------|
| **Draw.io** (C1, C2, C3, Sequence) | [drawio/](drawio/) — 4 файла `.drawio` |
| **OpenAPI** | [openapi/recommendation-api.yaml](../openapi/recommendation-api.yaml) |

### Файлы Draw.io

| Файл | Уровень |
|------|---------|
| [c1-context.drawio](drawio/c1-context.drawio) | C1 — контекст |
| [c2-containers.drawio](drawio/c2-containers.drawio) | C2 — контейнеры |
| [c3-ai-service-recsys.drawio](drawio/c3-ai-service-recsys.drawio) | C3 — AI Service (recsys + LLM) |
| [sequence-get-recommendation.drawio](drawio/sequence-get-recommendation.drawio) | Sequence — запрос рекомендации |

Открыть в [diagrams.net](https://app.diagrams.net/) или приложении Draw.io. Ссылку на `hw-2/diagrams/drawio/` + OpenAPI — в форму сдачи.

## Связность (проверить перед отправкой)

**C3 recsys + Sequence + OpenAPI** — одна цепочка MVP:

- C3: Controller → Router → Loader → Ranker → RAG Manager → Prompt Factory → LLM Client → Response Builder (+ SQL DB, Redis, Vector DB)
- Sequence: те же компоненты AI Service + Frontend, Backend, SQL DB, Redis, Vector DB
- API: `POST /get_recommendation` — поля `user_id`, `context`, `product_id`, `limit`; ответ `recommendations[]` (`sku_id`, `score`, `title`); ошибки 400, 401, 404, 503, 500

| C3 | Sequence |
|----|----------|
| Recommendation Controller | Rec. Controller |
| Scenario Router | Scenario Router |
| Candidate Loader | Candidate Loader |
| Ranker | Ranker |
| RAG Manager | RAG Manager |
| Prompt Template Factory | Prompt Factory |
| LLM Client | LLM Client |
| Response Builder | Response Builder |
| SQL DB / Redis / Vector DB | SQL DB / Redis / Vector DB |

**C2:** Frontend, Backend, AI Service, SQL DB, Vector DB; Backend → AI Service подписано `get_recommendation`; компоненты C3 не рисуют на C2.

## Для себя (не сдавать)

| Папка | Назначение |
|-------|------------|
| [_dev/](_dev/) | JSON-specs, генератор, шаблоны |
| [_dev/templates/](_dev/templates/) | Пример «чистого RAG» из формулировки ДЗ (не входит в MVP) |
| [tools/drawio-mcp/](../../tools/drawio-mcp/) | MCP/CLI перегенерации layout |
