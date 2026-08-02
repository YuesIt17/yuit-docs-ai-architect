# Домашнее задание hw-6 — RetailPartnerX

**Комплексное обеспечение качества: тестирование, безопасность и наблюдаемость**

> **Сокращения:** [Глоссарий](Glossary.md) · **Артефакты:** [docs/](docs/) · [diagrams/](diagrams/)

## Цель

Спроектировать комплекс обеспечения качества AI-системы RetailPartnerX, включая безопасность (PII / Guardrails), тестирование RAG и наблюдаемость с AI-метриками.

## Контекст и преемственность

| ДЗ | Артефакт | Связь с hw-6 |
| -- | -------- | ------------ |
| [hw-1](../hw-1/RetailPartnerX_AI_Strategy.md) | AI-стратегия, риски R4/R6/R8 | Токсичные рекомендации, GDPR/ПДн, галлюцинации genAI |
| [hw-2](../hw-2/diagrams/README.md) | C4, Sequence, OpenAPI | AI Service, `POST /get_recommendation` — точка установки guardrails |
| [hw-3](../hw-3/README.md) | Мультиагентный RAG-ассистент | Policy Analyst + RAG; усиление Security Layer на пути чата |
| [hw-4](../hw-4/README.md) | ADR: хостинг LLM | Сравнение моделей → план RAG-eval; Secret Manager для ключей |
| [hw-5](../hw-5/docs/data-pipeline.md) | Data pipeline / Vector DB | Свежесть Product KB влияет на Faithfulness / Context Recall |

**Задача:** для RetailPartnerX (рекомендации + шопинг-ассистент) закрыть контур **Security → RAG Testing → Observability**, чтобы MVP можно было безопасно выводить в prod с измеримым качеством ответов.

Тема заменяет абстрактный шаблон «QA любой LLM-системы», сохраняя структуру ДЗ (Security Layer → Testing Strategy → Observability).

## Шаги выполнения (артефакты решения)

| Шаг ДЗ | Документ / файл |
| ------ | --------------- |
| 1. Security Layer | [diagrams/security-layer.png](diagrams/security-layer.png) · [docs/quality-assurance.md](docs/quality-assurance.md) §1 |
| 2. Testing Strategy | [docs/quality-assurance.md](docs/quality-assurance.md) §2 — Faithfulness, Answer Relevancy, Ragas/DeepEval |
| 3. Observability | [docs/quality-assurance.md](docs/quality-assurance.md) §3 — виджеты Grafana (Golden Signals + AI) |

## Формат сдачи

| Артефакт | Путь |
| -------- | ---- |
| Схема Security | [diagrams/security-layer.drawio](diagrams/security-layer.drawio) · [PNG](diagrams/security-layer.png) |
| Документ: security + тест-план + дашборд | [docs/quality-assurance.md](docs/quality-assurance.md) |

## Критерии самопроверки

| Критерий | Как закрыто |
| -------- | ----------- |
| Безопасность | Prompt Injection (Input Guard) + утечки ПДн (PII Sanitizer) — [схема](diagrams/security-layer.png), [§1](docs/quality-assurance.md) |
| Метрики | Faithfulness / Answer Relevancy (не CPU) + AI-виджеты дашборда — [§2–3](docs/quality-assurance.md) |
| Инструментарий | Prometheus, Tempo, Langfuse, Ragas/DeepEval — [§2–3](docs/quality-assurance.md) |

Статус «Принято», если все три критерия выполнены.

## Полезные материалы

| Материал | Описание |
| -------- | -------- |
| [OWASP Top 10 for LLM](https://owasp.org/www-project-top-10-for-large-language-model-applications/) | Prompt Injection, Sensitive Information Disclosure, Improper Output Handling |
| [Примеры дашбордов Grafana](https://grafana.com/grafana/dashboards/) | Референсы виджетов Golden Signals |

## Компетенции

Проектировать и внедрять механизмы обеспечения качества (QA), отказоустойчивости и информационной безопасности (Security) в архитектуру AI-системы на всех этапах её жизненного цикла:

- разрабатывать планы тестирования для сравнения различных LLM-моделей в RAG-задачах;
- «усиливать» архитектуру AI-агентов компонентами безопасности (санитайзер, валидатор, secret manager);
- проектировать дашборды в Grafana для мониторинга ключевых SLO AI-сервисов.
