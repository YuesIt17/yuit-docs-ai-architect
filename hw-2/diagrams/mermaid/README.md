# Mermaid — RetailPartnerX (hw-2)

> **Кейс:** [RetailPartnerX_AI_Strategy.md](../../../hw-1/RetailPartnerX_AI_Strategy.md) · **Глоссарий:** [Glossary.md](../../Glossary.md) · **Просмотр в IDE:** [PREVIEW.md](PREVIEW.md)

| Файл | Уровень C4 | Назначение |
|------|------------|------------|
| [c1-context.md](c1-context.md) | C1 Context | Границы системы и внешние интеграции |
| [c2-containers.md](c2-containers.md) | C2 Container | Frontend, Backend, AI Service, БД |
| [c3-ai-service-recsys.md](c3-ai-service-recsys.md) | C3 Component | **MVP** — recsys внутри AI Service |
| [c3-ai-service-rag-future.md](c3-ai-service-rag-future.md) | C3 Component | **Future** — RAG + LLM |
| [sequence-get-recommendation.md](sequence-get-recommendation.md) | Sequence | Сценарий «запрос рекомендации» |

**Связность:** Sequence и [OpenAPI](../../openapi/recommendation-api.yaml) согласованы с **c3-ai-service-recsys** (не с RAG future).

**Структура:** в каждом `.md` сначала текст (заголовок, таблицы ссылок), затем блок ` ```mermaid ` в конце. Просмотр: [PREVIEW.md](PREVIEW.md).
