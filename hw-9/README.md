# Домашнее задание hw-9 — RetailPartnerX

**Архитектура для высоких нагрузок и Real-time обработки**

> **Сокращения:** [Глоссарий](Glossary.md) · **Артефакты:** [docs/](docs/) · [diagrams/](diagrams/)

## Цель

Спроектировать высоконагруженную архитектуру real-time AI-сервиса RetailPartnerX с кэшированием, горизонтальным масштабированием и асинхронной обработкой под **10 000 RPS** и **latency &lt; 200 ms** (синхронный путь).

## Контекст и преемственность

| ДЗ | Артефакт | Связь с hw-9 |
| -- | -------- | ------------ |
| [hw-1](../hw-1/RetailPartnerX_AI_Strategy.md) | NFR: p95 latency, roadmap Prod | Числовой SLO: 10k RPS, &lt;200 ms на sync-path |
| [hw-2](../hw-2/diagrams/README.md) | Ranker → Top-K → LLM; Redis кандидатов; A-001 | База latency-budget; multi-tier cache поверх Redis |
| [hw-3](../hw-3/README.md) | Multi-agent shopping assistant | Тяжёлые запросы → async queue; Semantic Cache по context window |
| [hw-4](../hw-4/docs/adr-001-llm-hosting.md) | LLM Client abstraction | Кэш и queue не меняют контракт клиента LLM |
| [hw-5](../hw-5/docs/data-pipeline.md) | Feature Store / Vector DB | Embeddings для Semantic Cache + Product KB |
| [hw-6](../hw-6/docs/quality-assurance.md) | Observability | Метрики hit-rate, queue depth, p95 — триггеры KEDA / rollback |
| [hw-7](../hw-7/docs/recommendation.md) | 2×A100 INT4 + vLLM @ 1000 RPM | Inference-поды = масштабируемый пул поверх sizing |
| [hw-8](../hw-8/docs/delivery-pipeline.md) | K8s + GitOps + Canary | Платформа для KEDA ScaledObject / Deployments |

**Задача:** сервис вырос — нужно выдержать **10 000 RPS** при **Latency &lt; 200 ms** за счёт Semantic Cache, KEDA по очереди и queue-based async для тяжёлых запросов.

Тема курса сохранена; паттерны привязаны к `/get_recommendation` (sync) и shopping assistant (async/heavy).

## Шаги выполнения (артефакты решения)

| Шаг ДЗ | Документ / файл |
| ------ | --------------- |
| 1. Caching Strategy | [docs/high-load-architecture.md](docs/high-load-architecture.md) §1 |
| 2. Scaling (KEDA) | [docs/high-load-architecture.md](docs/high-load-architecture.md) §2 · [схема](diagrams/high-load-architecture.png) |
| 3. Async Processing | [docs/high-load-architecture.md](docs/high-load-architecture.md) §3 |
| 4. Global Distribution (опц.) | [docs/high-load-architecture.md](docs/high-load-architecture.md) §4 |

## Формат сдачи

| Артефакт | Путь |
| -------- | ---- |
| Схема High-Load архитектуры | [diagrams/high-load-architecture.drawio](diagrams/high-load-architecture.drawio) · [PNG](diagrams/high-load-architecture.png) |
| Пояснительная записка по паттернам | [docs/high-load-architecture.md](docs/high-load-architecture.md) |

## Критерии самопроверки

| Критерий | Как закрыто |
| -------- | ----------- |
| Адекватность мер | Semantic Cache + Ranker/Top-K режут LLM RPS — [§1](docs/high-load-architecture.md), выводы [§5.1](docs/high-load-architecture.md) |
| Масштабируемость | HPA sync + KEDA по очереди + backpressure — [§2–3](docs/high-load-architecture.md), выводы [§5.2](docs/high-load-architecture.md), [схема](diagrams/high-load-architecture.png) |
| Latency | CDN / Edge / Redis / Semantic Cache + split async — [§1, §3, §4](docs/high-load-architecture.md), выводы [§5.3](docs/high-load-architecture.md) |

Статус «Принято», если все три критерия выполнены.

## Полезные материалы

| Материал | Описание |
| -------- | -------- |
| [Semantic Cache — Azure Cosmos DB](https://learn.microsoft.com/ru-ru/azure/cosmos-db/gen-ai/semantic-cache) | Векторный кэш запросов/completions LLM |
| [KEDA](https://keda.sh/) | Event-driven autoscaling в Kubernetes |

## Компетенции

Применять сложные архитектурные паттерны для масштабирования, real-time и гибридных сред:

- аргументированно обосновывать выбор оркестрации (Kubernetes + KEDA vs чистый Serverless);
- проектировать EDA для реактивной обработки тяжёлых AI-запросов;
- проектировать высоконагруженный сервис с низкой задержкой (кэш, Edge).
