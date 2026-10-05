# Домашнее задание hw-10 — RetailPartnerX

**FinOps и Governance: управление стоимостью и этикой AI**

> **Сокращения:** [Глоссарий](Glossary.md) · **Артефакты:** [docs/](docs/)

## Цель

Разработать **Model Card** для AI-системы RetailPartnerX и **FinOps-отчёт** с анализом превышения облачного бюджета на 50% и планом Cost Optimization.

## Контекст и преемственность

| ДЗ | Артефакт | Связь с hw-10 |
| -- | -------- | ------------- |
| [hw-1](../hw-1/RetailPartnerX_AI_Strategy.md) | Риски R1–R8, GDPR/152-ФЗ | Bias / fairness ↔ R1, R4, R6; этика рекомендаций |
| [hw-2](../hw-2/diagrams/README.md) | Ranker → Top-K → LLM | Routing: «умная» модель не на каждый запрос |
| [hw-3](../hw-3/docs/agents.md) | Multi-agent + Policy Analyst | Intended use / limitations; audit решений агентов |
| [hw-4](../hw-4/docs/adr-001-llm-hosting.md) | SaaS → self-hosted roadmap | Cost envelope и vendor / residency trade-offs |
| [hw-5](../hw-5/docs/data-pipeline.md) | Kafka → S3 → Feature Store | Training data, skew, TTL логов и сырья |
| [hw-6](../hw-6/docs/quality-assurance.md) | Guardrails, Langfuse, eval | Audit trail решений; cost-метрики |
| [hw-7](../hw-7/docs/inference-sizing.md) | 2×A100 INT4 + vLLM ~464k ₽/мес | Базовый GPU OpEx для FinOps-сценария |
| [hw-8](../hw-8/docs/delivery-pipeline.md) | Canary, Model Registry | Версии модели в Model Card / реестре |
| [hw-9](../hw-9/docs/high-load-architecture.md) | Semantic Cache, KEDA | Снижение LLM RPS = снижение OpEx |

**Задача:** для RetailPartnerX (рекомендации + shopping assistant) закрыть контур **Governance (Model Card + audit)** и **FinOps (overrun + optimization)**, чтобы этика и unit economics были явными архитектурными артефактами, а не «устным договором».

Тема курса сохранена; шаблоны Hugging Face Model Cards и Mitchell et al., 2018 адаптированы под систему RetailPartnerX, а не под абстрактную модель на Hub.

## Шаги выполнения (артефакты решения)

| Шаг ДЗ | Документ / файл |
| ------ | --------------- |
| 1. Model Card (Intended Use, Bias, Fairness) | [docs/model-card-and-finops.md §1](docs/model-card-and-finops.md#L23) |
| 2. Audit logging решений AI | [docs/model-card-and-finops.md §1.6](docs/model-card-and-finops.md#L178) |
| 3. Анализ счёта (+50% к бюджету) | [docs/model-card-and-finops.md §2.1–2.2](docs/model-card-and-finops.md#L253) |
| 4. План Cost Optimization | [docs/model-card-and-finops.md §2.3–2.5](docs/model-card-and-finops.md#L294) |

## Формат сдачи

| Артефакт | Путь |
| -------- | ---- |
| Model Card + FinOps-отчёт с планом действий | [docs/model-card-and-finops.md](docs/model-card-and-finops.md) |

Доступ по ссылке не требуется: артефакт в репозитории.

## Критерии самопроверки

| Критерий | Как закрыто |
| -------- | ----------- |
| Этика | Model Card по структуре HF/Mitchell: use/limitations, данные, bias, fairness — [§1](docs/model-card-and-finops.md#L23) |
| Экономика | Конкретные техмеры (Spot, distillation, TTL, routing, cache) с оценкой ₽ — [§2.3](docs/model-card-and-finops.md#L294) |
| Зрелость | Явный баланс цена ↔ качество и когда *не* экономить — [§2.5](docs/model-card-and-finops.md#L346) |

Статус «Принято», если все три критерия выполнены.

## Полезные материалы

| Материал | Описание |
| -------- | -------- |
| [Hugging Face — Model Cards](https://huggingface.co/docs/hub/model-cards) | Метаданные + текст карточки модели |
| [Mitchell et al. — Model Cards for Model Reporting](https://arxiv.org/abs/1810.03993) | Исходный фреймворк transparent model reporting |
| [FinOps Framework](https://www.finops.org/framework/) | Principles, Domains, Capabilities (Inform → Optimize → Operate) |

## Компетенции

Принимать архитектурные решения с учётом экономической эффективности и стратегических целей бизнеса:

- проектировать Model Card и архитектуру логирования решений AI для аудита;
- анализировать облачные счета и предлагать архитектурные изменения для снижения затрат.
