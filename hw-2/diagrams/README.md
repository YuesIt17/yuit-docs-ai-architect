# Архитектура hw-2 — RetailPartnerX

Краткое описание проделанной работы: **что спроектировано, почему так, как артефакты связаны**.

Кейс: [RetailPartnerX_AI_Strategy.md](../hw-1/RetailPartnerX_AI_Strategy.md) · термины: [Glossary.md](../Glossary.md)

---

## Контекст

**Задача ДЗ:** многоуровневая архитектура AI-сервиса рекомендаций — C4 (C1–C3), Sequence, OpenAPI для интеграции Backend ↔ AI Service.

**Scope MVP:** блок «С этим покупают» на **карточке товара** (`context=product_page`). Чекаут описан в API, но основной сценарий на диаграммах — карточка SKU.

**NFR:** синхронный ответ Backend ↔ AI Service; метрика качества — **p95 latency** (см. ниже). Конкретный порог в миллисекундах в hw-1 **не задан** — в архитектуре заложен запас под жёсткий latency-бudget (Ranker → Top-K → LLM).

---

## NFR: откуда p95 и что означает «95»

**Источник термина:** [RetailPartnerX_AI_Strategy.md](../hw-1/RetailPartnerX_AI_Strategy.md) — в NFR/SLO для Production указаны *latency (p95)* и мониторинг *p95 latency*; расшифровка — [hw-1/Glossary.md](../hw-1/Glossary.md) (*95th percentile latency*).

**Что такое p95:** время, в которое укладываются **95% запросов**; остальные 5% — «хвост» (медленные выбросы). Не среднее и не «каждый запрос», а типичная практика SLA/SLO в проде: среднее скрывает редкие тормоза, p99 часто слишком жёсткий для MVP.

**Почему это в hw-2:** блок на карточке ждёт ответ синхронно → архитектура (кэш, SQL, Top-K, короткий LLM) проектируется под контроль **хвоста** задержек, а не только «среднего случая».

### Допущение A-001 (latency-budget)

| | |
|---|---|
| **Контекст** | В hw-1 есть класс NFR «p95 latency», но **нет числа** в ms для MVP |
| **Допущение** | Для проектирования принят **синхронный** вызов «как часть отрисовки карточки»; числовой SLO согласуется с заказчиком на этапе MVP (PoC-замеры, A/B) |
| **Следствие для архитектуры** | LLM не на весь каталог — только Top-K после Ranker; Redis для precomputed кандидатов |

*Число «250 ms» намеренно не фиксируем в артеfactах: это было бы выдуманным порогом без замеров.*

---

## Итог (summary)

Спроектирована система из Frontend, Backend, **AI Service**, SQL DB и Vector DB. Backend вызывает AI Service через **`POST /get_recommendation`**. Внутри AI Service — пайплайн **recsys + LLM**: классический отбор кандидатов (Loader, Ranker) и семантическое переранжирование (RAG, Prompt, LLM).

---

## Артефакты для сдачи

| Артефакт | Файл | Вопрос, на который отвечает |
|----------|------|----------------------------|
| C1 | [c1-context.drawio](c1-context.drawio) | Границы системы и внешние интеграции |
| C2 | [c2-containers.drawio](c2-containers.drawio) | Из каких deployable-частей состоит решение |
| C3 | [c3-ai-service-recsys.drawio](c3-ai-service-recsys.drawio) | Как устроен AI Service внутри |
| Sequence | [sequence-get-recommendation.drawio](sequence-get-recommendation.drawio) | Один пользовательский сценарий по шагам |
| OpenAPI | [recommendation-api.yaml](../openapi/recommendation-api.yaml) | Контракт Backend → AI Service |

**Формат сдачи:** ссылка на `hw-2/diagrams/` (4 `.drawio`) + OpenAPI YAML.

---

## Ключевые решения

### 1. AI Service — отдельный контейнер (C2)

| | |
|---|---|
| **Контекст** | Рекомендации — отдельная ML/LLM-нагрузка, свой цикл релизов и SLA |
| **Решение** | Backend оркестрирует UI и каталог; AI Service — отдельный REST-сервис |
| **Последствия** | (+) независимый деплой и масштабирование AI; (−) нужен явный контракт API и auth между сервисами |

### 2. Гибрид Ranker + LLM (C3)

| | |
|---|---|
| **Контекст** | Полный прогон каталога через LLM дорог и медленный; NFR — синхронный блок на карточке, метрика **p95** из стратегии hw-1 (раздел NFR выше) |
| **Решение** | **Ranker** (ML pre-score) сужает список до Top-K → **RAG + LLM** переранжируют маленький набор с контекстом карточки |
| **Последствия** | (+) latency и стоимость под контролем (допущение A-001); (+) co-purchase и история сохраняются; Ranker — модуль внутри AI Service, не отдельный контейнер |

### 3. Один эндпоинт интеграции (OpenAPI)

| | |
|---|---|
| **Контекст** | ДЗ требует спецификацию Backend ↔ AI Service |
| **Решение** | `POST /get_recommendation`, Bearer JWT; запрос: `user_id`, `context`, `product_id`, `limit`; ответ: `recommendations[]` |
| **Последствия** | Backend и QA могут работать по контракту до готовности всего пайплайна; ошибки: **400, 401, 404, 503, 500** (сообщения на русском) |

### 4. Связность C3 ↔ Sequence ↔ OpenAPI

| | |
|---|---|
| **Контекст** | Критерий ДЗ — компоненты C3 должны соответствовать шагам Sequence |
| **Решение** | На Sequence те же компоненты AI Service, что на C3; вызов Backend → Controller = операция в OpenAPI |
| **Последствия** | Проверка: каждый блок C3 имеет lifeline на Sequence; шаг `POST /get_recommendation` = стрелка Backend → AI Service на C2 |

### 5. Шаблон «чистого RAG» — вне MVP

| | |
|---|---|
| **Контекст** | В тексте ДЗ перечислены Controller, RAG Manager, LLM Client, Prompt Factory |
| **Решение** | Учебный RAG-only чертёж вынесен в [_dev/templates/](_dev/templates/); рабочая C3 — **recsys + LLM** |
| **Последствия** | В сдачу идёт одна согласованная C3, без дублирования |

---

## Сценарий MVP (happy path)

1. Покупатель открывает карточку **SKU-123**.
2. Frontend → Backend: данные товара.
3. Backend → **Rec. Controller**: `POST /get_recommendation` (`user_id=1002847`, `context=product_page`).
4. **Router** определяет сценарий; **RAG Manager** получает контекст товара из **Vector DB**.
5. **Loader** берёт кандидатов из **Redis**, признаки — из **SQL DB**.
6. **Ranker** → Top-K → **Prompt Factory** (+ контекст RAG) → **LLM Client** → **Response Builder**.
7. Ответ с `recommendations[]` → UI: блок «С этим покупают».

---

## Карта связности (C3 = Sequence)

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

**C2:** компоненты C3 не рисуются; видны только Frontend, Backend, AI Service, SQL DB, Vector DB.

---

## Вне scope сдачи

| Путь | Назначение |
|------|------------|
| [_dev/](_dev/) | JSON-specs layout, генератор Draw.io |
| [_dev/templates/](_dev/templates/) | Пример RAG из формулировки ДЗ |

---

## Быстрая самопроверка перед отправкой

- [ ] C2: пять контейнеров, Backend → AI Service подписано `get_recommendation`
- [ ] C3 и Sequence: одинаковые имена компонентов AI Service
- [ ] OpenAPI: примеры запроса/ответа, коды 400 / 401 / 404 / 503 / 500
- [ ] Нет смешения уровней C2 и C3 на одной схеме
