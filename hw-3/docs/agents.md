# Шаг 1: выбор паттернов и агентов

Кейс: [RetailPartnerX AI Strategy](../../hw-1/RetailPartnerX_AI_Strategy.md) · архитектура: [hw-2](../../hw-2/diagrams/README.md)

## Паттерн

**Supervisor / hierarchical multi-agent** — Orchestrator (Менеджер) координирует специализированных агентов. Каждый агент — отдельный узел LangGraph с чёткой зоной ответственности.

## Mapping с шаблоном ДЗ (командировки → ритейл)

| Шаблон ДЗ | Агент RetailPartnerX | Задача |
|-----------|---------------------|--------|
| Менеджер | **Orchestrator** | План, делегирование, финальный ответ в чат |
| Поисковик билетов | **Catalog Searcher** | Семантический поиск SKU в каталоге |
| Аналитик бюджета | **Promo & Budget Analyst** | Акции, укладка в бюджет |
| Бронировщик отелей | **Basket Assembler** | Сборка корзины, замены при OOS |
| — (новый) | **Intent & Constraint Parser** | Извлечение сущностей из запроса |
| Политика командировок (RAG) | **Policy Analyst** | RAG по Policy KB: аллергены, 18+, GDPR |

## Декомпозиция агентов (SRP)

| Агент | Ответственность (одна зона) | Инструменты / данные | Не делает |
|-------|----------------------------|----------------------|-----------|
| **Orchestrator** | Маршрутизация шагов, синтез ответа пользователю | LLM, LangGraph state | Поиск SKU, проверка политик |
| **Intent & Constraint Parser** | NER: блюдо, персоны, диеты, бюджет, аллергены | LLM structured output | Поиск товаров |
| **Catalog Searcher** | Семантический поиск и фильтрация SKU | Vector DB (`products`), SQL DB (цена, наличие) | Проверка compliance |
| **Policy Analyst** | Валидация ограничений по политикам компании | **RAG** → Policy KB (`policies` collection) | Подбор акций |
| **Promo & Budget Analyst** | Оптимизация набора под бюджет и промо | SQL DB (цены, акции), фрагменты RAG | Формирование корзины |
| **Basket Assembler** | Итоговая корзина, substitutes | `POST /get_recommendation` (hw-2 API) как tool | Парсинг намерения |

## Почему не один монолитный агент

1. **Разные источники данных** — каталог (vector + SQL) и политики (RAG) требуют разных retrieval-стратегий; смешение в одном промпте ухудшает точность и audit.
2. **Compliance (hw-1, R4/R8)** — Policy Analyst изолирован: его можно тестировать и логировать отдельно; Orchestrator не публикует ответ без `policy_status=ok`.
3. **Переиспользование hw-2** — Basket Assembler вызывает существующий recsys API без дублирования Ranker/RAG Manager.

## Guardrails (риски из hw-1)

| Риск | Митигация агентом |
|------|-------------------|
| **R4** — токсичные/запрещённые рекомендации | Policy Analyst: blocklists в Policy KB, отказ в рекомендации |
| **R6** — GDPR / согласия | Policy Analyst: проверка `personalization_consent` перед персональными подборами |
| **R8** — галлюцинации genAI | Ответ только на основе retrieval chunks + citations; fallback при низком score |

## Поток делегирования (упрощённо)

```
User message
  → Orchestrator
    → Intent Parser (constraints)
    → parallel: Catalog Searcher | Policy Analyst
    → Promo & Budget Analyst
    → Basket Assembler
  → Orchestrator (synthesize)
  → User response
```
