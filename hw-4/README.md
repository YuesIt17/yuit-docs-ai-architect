# Домашнее задание hw-4 — RetailPartnerX

**Фиксация архитектурных решений (ADR) и подготовка к защите**

> **Сокращения:** [Глоссарий](Glossary.md) · **Артефакты:** [docs/](docs/)

## Цель

Зафиксировать архитектурное решение о выборе способа хостинга LLM (SaaS vs Self-hosted) в формате ADR для обоснования перед техническим руководством (CTO).

## Контекст и преемственность

| ДЗ                                            | Артефакт                       | Связь с hw-4                                              |
| --------------------------------------------- | ------------------------------ | --------------------------------------------------------- |
| [hw-1](../hw-1/RetailPartnerX_AI_Strategy.md) | AI-стратегия рекомендаций      | Риски R6 (ПДн), R7 (vendor lock-in), R8 (галлюцинации)    |
| [hw-2](../hw-2/diagrams/README.md)            | C4, Sequence, OpenAPI          | LLM Client в AI Service, p95 latency / NFR                |
| [hw-3](../hw-3/README.md)                     | Мультиагентный RAG-ассистент   | Чат-помощник зависит от LLM; нужен выбор модели/хостинга  |

**Задача:** для RetailPartnerX (персональный шопинг-ассистент в чате приложения) выбрать, где хостить LLM: проприетарная облачная модель (SaaS, напр. GPT) или Open-Source модель (напр. Llama 3) на своих серверах (Self-hosted).

Тема заменяет абстрактный шаблон «любой проект», сохраняя структуру ДЗ (анализ → ADR → pitch).

## Шаги выполнения (артефакты решения)

| Шаг ДЗ              | Документ / файл                                                                 |
| ------------------- | ------------------------------------------------------------------------------- |
| 1. Анализ критериев | [docs/llm-hosting-comparison.md](docs/llm-hosting-comparison.md) — Стоимость, Privacy, Качество, Latency, Поддержка |
| 2. Решение + ADR    | [docs/adr-001-llm-hosting.md](docs/adr-001-llm-hosting.md) — Title, Status, Context, Decision, Consequences (Pros/Cons) |
| 3. Pitch для CTO    | [docs/cto-pitch.md](docs/cto-pitch.md) — 1 абзац, почему решение верно в текущих условиях |

## Формат сдачи

| Артефакт                         | Путь                                                                   |
| -------------------------------- | ---------------------------------------------------------------------- |
| Сравнение SaaS vs Self-hosted    | [docs/llm-hosting-comparison.md](docs/llm-hosting-comparison.md)       |
| ADR (Markdown)                   | [docs/adr-001-llm-hosting.md](docs/adr-001-llm-hosting.md)             |
| Pitch для CTO                    | [docs/cto-pitch.md](docs/cto-pitch.md)                                 |

Шаблоны ADR: [architecture-decision-record](https://github.com/architecture-decision-record/architecture-decision-record) · [MADR](https://adr.github.io/madr/).

## Критерии самопроверки

| Критерий      | Как закрыто                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| Структура ADR | Стандартный формат: Title, Status, Context, Decision, Consequences — [docs/adr-001-llm-hosting.md](docs/adr-001-llm-hosting.md) |
| Аргументация  | Выбор обоснован фактами (таблица критериев) — [docs/llm-hosting-comparison.md](docs/llm-hosting-comparison.md) |
| Честность     | В Consequences указаны минусы и trade-offs принятого решения                                         |

Статус «Принято», если все три критерия выполнены.

## Полезные материалы

| Материал                                                                                         | Описание                                      |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| [Architecture Decision Record](https://github.com/architecture-decision-record/architecture-decision-record) | Обзор практики ADR                  |
| [MADR](https://adr.github.io/madr/)                                                              | Markdown-шаблон Architectural Decision Records |
| [Cloud vs On-prem LLM costs (a16z)](https://a16z.com/navigating-the-high-cost-of-ai-compute/)     | Стоимость облака vs on-prem compute            |

## Компетенции

Разрабатывать, документировать и верифицировать архитектуру AI-решений на различных уровнях детализации:

- составлять Architecture Decision Records (ADR) для обоснования ключевых архитектурных решений;
- аргументированно защищать архитектурные решения (самопроверка / подготовка к ревью).
