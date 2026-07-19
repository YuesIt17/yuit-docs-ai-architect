# Домашнее задание hw-5 — RetailPartnerX

**Проектирование Data Pipelines и интеграционных шлюзов**

> **Сокращения:** [Глоссарий](Glossary.md) · **Артефакты:** [docs/](docs/) · [diagrams/](diagrams/)

## Цель

Спроектировать data pipeline и выбрать хранилища для обеспечения консистентности данных при обучении и инференсе AI-системы рекомендаций RetailPartnerX.

## Контекст и преемственность

| ДЗ                                            | Артефакт                       | Связь с hw-5                                                                 |
| --------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------- |
| [hw-1](../hw-1/RetailPartnerX_AI_Strategy.md) | AI-стратегия рекомендаций      | Риск R1 (качество поведенческих данных); KPI CTR; CDP / PIM в контуре        |
| [hw-2](../hw-2/diagrams/README.md)            | C4, Sequence, OpenAPI          | PIM (каталог), CDP/CRM (события), Vector DB, Ranker, `POST /get_recommendation` |
| [hw-3](../hw-3/README.md)                     | Мультиагентный RAG-ассистент   | Product KB / эмбеддинги в Vector DB нуждаются в регулярном обновлении        |
| [hw-4](../hw-4/README.md)                     | ADR: хостинг LLM               | Inference LLM ≠ data plane; пайплайны данных независимы от SaaS/self-hosted  |

**Задача:** для RetailPartnerX (персонализированные рекомендации + шопинг-ассистент) обеспечить регулярное обновление данных о **товарах** и **поведении пользователей**, чтобы offline-обучение Ranker и online-инференс (карточка товара, чат) опирались на согласованные признаки и эмбеддинги.

Тема заменяет абстрактный шаблон «система рекомендаций», сохраняя структуру ДЗ (источники → ETL/ELT → хранилища → governance).

## Шаги выполнения (артефакты решения)

| Шаг ДЗ               | Документ / файл                                                                 |
| -------------------- | ------------------------------------------------------------------------------- |
| 1. Data Sources      | [docs/data-pipeline.md](docs/data-pipeline.md) — §1 источники (stream / batch)  |
| 2. Pipeline Design   | [diagrams/data-pipeline.png](diagrams/data-pipeline.png) · [docs §2](docs/data-pipeline.md) |
| 3. Storage Selection | [docs/data-pipeline.md](docs/data-pipeline.md) — §3 стек Kafka → Spark → S3 → FS / Vector DB |
| 4. Data Governance   | [docs/data-pipeline.md](docs/data-pipeline.md) — §4 Training-Serving Skew        |

## Формат сдачи

| Артефакт                      | Путь                                                                   |
| ----------------------------- | ---------------------------------------------------------------------- |
| Схема архитектуры данных      | [diagrams/data-pipeline.drawio](diagrams/data-pipeline.drawio) · [PNG](diagrams/data-pipeline.png) |
| Текстовое описание (1–2 стр.) | [docs/data-pipeline.md](docs/data-pipeline.md)                         |

## Критерии самопроверки

| Критерий         | Как закрыто                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| Выбор технологий | Stream (Kafka + Spark Streaming) vs Batch (PIM → Spark) — [docs](docs/data-pipeline.md) §1–3         |
| Полнота потока   | PIM/CDP → Lake → Feature Store / Vector DB → AI Service — [схема](diagrams/data-pipeline.png)        |
| Feature Store    | Offline + Redis online, единые definitions, anti-skew — [docs](docs/data-pipeline.md) §4             |

Статус «Принято», если все три критерия выполнены.

## Полезные материалы

| Материал                                                                 | Описание                          |
| ------------------------------------------------------------------------ | --------------------------------- |
| [Пример архитектуры Lambda/Kappa](https://bigdataschool.ru/blog/kappa-architecture/) | Batch + stream vs единый поток |

## Компетенции

Проектировать и внедрять механизмы обеспечения качества (QA), отказоустойчивости и информационной безопасности (Security) в архитектуру AI-системы на всех этапах её жизненного цикла:

- проектировать отказоустойчивые интеграции с унаследованными системами через брокеры сообщений;
- проектировать сквозные (end-to-end) data pipelines для AI-систем, от сбора до подготовки данных для обучения моделей.
