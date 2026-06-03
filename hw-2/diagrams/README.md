# Диаграммы hw-2 — RetailPartnerX

Архитектура MVP: персональные рекомендации на **карточке товара**. Кейс: [RetailPartnerX_AI_Strategy.md](../hw-1/RetailPartnerX_AI_Strategy.md).

| Папка | Инструмент | Назначение |
|-------|------------|------------|
| [mermaid/](mermaid/) | **C4** + `sequenceDiagram` в `.md` | [mermaid/README.md](mermaid/README.md), [PREVIEW.md](mermaid/PREVIEW.md) |
| [drawio/](drawio/) | [diagrams.net](https://app.diagrams.net/) | C4-нотация для сдачи, синхрон с GitHub |

**Глоссарий:** [Glossary.md](../Glossary.md)

## Состав диаграмм

| Файл | Уровень | Роль |
|------|---------|------|
| `c1-context` | C1 | Границы системы и внешние интеграции |
| `c2-containers` | C2 | Frontend, Backend, AI Service, SQL DB, Vector DB |
| `c3-ai-service-recsys` | C3 | **Основной** LLD: recsys (MVP / PoC) |
| `c3-ai-service-rag-future` | C3 | **Future:** RAG + LLM (Prod / genAI) |
| `sequence-get-recommendation` | Sequence | Сценарий «запрос рекомендации» |

## Связность (критерии ДЗ)

**Sequence и OpenAPI** согласованы только с **recsys** (`c3-ai-service-recsys`):

- C3: Controller → Router → Loader → Ranker → Response Builder
- Sequence: те же компоненты + Frontend, Backend, SQL DB, Redis
- API: `POST /get_recommendation` — [openapi/recommendation-api.yaml](../openapi/recommendation-api.yaml)

RAG-схема — отдельный этап; не используется в Sequence/API MVP.

## Чеклист связности

[CONSISTENCY-CHECKLIST.md](CONSISTENCY-CHECKLIST.md)

## Сдача

- Диаграммы: ссылка на `hw-2/diagrams/drawio/` (после сохранения `.drawio` из diagrams.net)
- Дополнительно: `hw-2/diagrams/mermaid/` для превью в репозитории
- OpenAPI: [openapi/recommendation-api.yaml](../openapi/recommendation-api.yaml)
