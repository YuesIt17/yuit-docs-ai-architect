# Саммари для собеседования — Solution Architect (AI / Retail)

> Краткая шпаргалка по кейсу **RetailPartnerX** (ДЗ hw-1 + hw-2). Полные артефакты: [hw-1](hw-1/RetailPartnerX_AI_Strategy.md), [hw-2](hw-2/README.md).  
> Общие темы архитектуры: [ARCHITECTURE-INTERVIEW-CHEATSHEET.md](ARCHITECTURE-INTERVIEW-CHEATSHEET.md).

---

## 30 секунд — кто я и о чём кейс

Архитектор решений в интеграторе. Клиент — FMCG-ритейлер, хочет персональные рекомендации «как у Tesco / X5», без KPI и границ данных. Моя задача: **снять неопределённость**, выбрать **контракт по этапам**, закрыть **AI-риски** и дать **архитектуру + API** для интеграции.

---

## Контекст заказчика

| | |
|--|--|
| **Бизнес** | Международный grocery / FMCG, omnichannel |
| **Цель** | Персонализированные рекомендации SKU |
| **Проблема** | Размытые требования, нет метрик успеха, неизвестно качество данных |
| **Внешний контур** | PIM (каталог), CDP/CRM (события), лояльность (customer ID) |
| **Регуляторика** | GDPR, 152-ФЗ, согласия на ПДн |

---

## Мой подход (3 опоры)

1. **Discovery** — 5–7 вопросов клиенту (KPI, каналы, данные, cold start, системы, NFR, governance).
2. **Поэтапная поставка** — PoC → MVP → Production (~10 мес.), измеримый DoD на каждом этапе.
3. **Контракт под риск** — не чистый FP на старте; гибрид после проверки гипотезы.

---

## Контрактная модель (что сказать на собесе)

| Этап | Модель | Почему |
|------|--------|--------|
| **PoC** (4–6 нед.) | **T&M with cap** | Высокая неопределённость; платим за проверку гипотезы, не за «чёрный ящик» |
| **MVP** | **Гибрид:** FP на интеграцию/UI + T&M на ML/данные | Предсказуемость «коробки», гибкость там, где идут итерации модели |
| **Production** | Рамочный **FP + SLA + ретейнер** | MLOps, retrain, масштаб |

**CR-триггеры (примеры):** новый источник событий, смена KPI, >2 touchpoints, рост каталога >30%, ужесточение latency >20%.

---

## Roadmap и DoD (коротко)

| Веха | Срок | Успех (DoD) |
|------|------|-------------|
| Discovery | нед. 0–2 | Charter PoC, матрица ответов |
| PoC | нед. 3–8 | Offline-метрики (NDCG@10, HitRate@10) vs baseline → **go/no-go** |
| MVP | мес. 3–6 | 1 канал в prod, A/B или shadow, мониторинг KPI |
| Production | мес. 7–10 | Все touchpoints, MLOps, SLO (latency, uptime) |

**MVP-сценарий в архитектуре:** блок «С этим покупают» на **карточке товара**.

---

## Архитектура (hw-2)

### C2 — контейнеры

`Покупатель` → **Frontend** → **Backend (BFF)** → **AI Service**  
Параллельно: Backend ↔ **SQL DB**, AI Service ↔ **SQL** + **Redis**; каталог из **PIM**; **Vector DB** — опционально / future RAG.

### C3 — AI Service (MVP = recsys, не RAG)

Цепочка синхронного запроса:

`Controller` → `Router` → `Loader` → `Ranker` → `Builder` → ответ  
Данные: **Redis** (кэш кандидатов), **SQL** (история).

**Future (Prod):** отдельная C3 с RAG Manager, LLM Client, Prompt Factory, Vector DB — **не в MVP Sequence/API**.

### API

`POST /get_recommendation` — Backend → AI Service  
Тело: `user_id`, `context` (product_page / checkout), `product_id`, `limit`  
Целевой **p95 latency ~250 ms**; коды 400 / 404 / 503 / 500.

---

## Топ-риски AI (что помню без шпаргалки)

| Риск | Митигация |
|------|-----------|
| Плохие/неполные события | Data audit в PoC, единый customer ID |
| Cold start (user/SKU) | Popularity + content-based fallback |
| Drift модели | Мониторинг offline/online, регламент retrain |
| Нерелевантные рекомендации | Blocklists, фильтры, human-in-the-loop на пилоте |
| Latency в пик | Кэш Redis, autoscaling, нагрузочные тесты |
| Compliance (GDPR/152-ФЗ) | Privacy review, минимизация ПДн, DPIA |
| GenAI (future) | Guardrails, без автопубликации, абстракция провайдера |

---

## Вопросы, которые я задам интервьюеру / заказчику

- Какой **primary KPI** закрывает PoC? (CTR, конверсия, AOV, доля выручки с блока)
- Где **первый touchpoint** в MVP — только карточка или ещё корзина/push?
- Есть ли **единый ID** между online и offline?
- Какие **NFR**: p95 latency, SLA, explainability?
- Кто **владелец продукта** и как принимаем A/B?

---

## Типичные вопросы на собесе — короткие ответы

**Почему не FP с первого дня?**  
Нет зафиксированных KPI, не проверены данные и алгоритм — FP приведёт к CR-войнам.

**Почему recsys в MVP, а не LLM/RAG?**  
Меньше риск (галлюцинации, latency, стоимость); ценность FMCG-recsys доказывается классическим ранжированием; RAG — этап Prod при явном use case.

**Как Backend не зависит от ML-деталей?**  
Контракт OpenAPI + BFF; внутри AI Service — сменяемые Loader/Ranker без смены API.

**Что в PoC go/no-go?**  
Offline-метрики на hold-out ≥ baseline **или** явный no-go с причинами (данные, coverage).

---

## Артефакты в репозитории

| Что | Где |
|-----|-----|
| Стратегия, контракт, риски, roadmap | [hw-1/RetailPartnerX_AI_Strategy.md](hw-1/RetailPartnerX_AI_Strategy.md) |
| C4 + Sequence (Mermaid) | [hw-2/diagrams/mermaid/](hw-2/diagrams/mermaid/) |
| Диаграммы для сдачи (Draw.io) | [hw-2/diagrams/drawio/](hw-2/diagrams/drawio/) |
| OpenAPI | [hw-2/openapi/recommendation-api.yaml](hw-2/openapi/recommendation-api.yaml) |
| Термины (C4, NFR, метрики) | [hw-2/Glossary.md](hw-2/Glossary.md) |

---

## Перед встречей (чеклист)

- [ ] Проговорить вслух: контракт PoC/MVP/Prod + один риск с митигацией  
- [ ] Нарисовать на доске C2 (5 контейнеров) и путь запроса до Ranker  
- [ ] Вспомнить один вопрос клиенту и один CR-триггер  
- [ ] Открыть Sequence + фрагмент OpenAPI на случай deep-dive
