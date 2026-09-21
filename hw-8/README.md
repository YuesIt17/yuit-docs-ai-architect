# Домашнее задание hw-8 — RetailPartnerX

**Автоматизация поставки: IaC, CI/CD и MLOps-конвейеры**

> **Сокращения:** [Глоссарий](Glossary.md) · **Артефакты:** [docs/](docs/) · [diagrams/](diagrams/)

## Цель

Спроектировать автоматизированный пайплайн поставки AI-сервиса RetailPartnerX с интеграцией обучения моделей и Canary-релизом.

## Контекст и преемственность

| ДЗ | Артефакт | Связь с hw-8 |
| -- | -------- | ------------ |
| [hw-1](../hw-1/RetailPartnerX_AI_Strategy.md) | Roadmap PoC→MVP→Prod | Prod = автоматизация поставки + безопасный релиз |
| [hw-2](../hw-2/diagrams/README.md) | AI Service, OpenAPI | Артефакт деплоя: Docker-образ сервиса + контракт API |
| [hw-3](../hw-3/README.md) | Multi-agent RAG | Релиз агентов + обновление Product/Policy KB |
| [hw-4](../hw-4/docs/adr-001-llm-hosting.md) | LLM hosting ADR | LLM Client не меняет контракт деплоя; секреты через Secret Manager |
| [hw-5](../hw-5/docs/data-pipeline.md) | Kafka → S3 → Feature Store / Vector DB | Триггер MLOps: новый curated dataset / catalog → retrain + re-embed |
| [hw-6](../hw-6/docs/quality-assurance.md) | Eval gates, observability | Unit/E2E + Ragas/DeepEval в CI; метрики отката Canary |
| [hw-7](../hw-7/docs/recommendation.md) | GPU sizing | K8s node pools / GPU node group под self-hosted LLM (roadmap) |

**Задача:** для RetailPartnerX (рекомендации + шопинг-ассистент) описать **IaC → CI/CD → MLOps → Canary**, чтобы код приложения и версия модели из Model Registry поставлялись в prod с минимумом ручных действий.

Тема курса сохранена; пайплайны привязаны к AI Service, Ranker, Vector DB и eval-гейтам из предыдущих модулей.

## Шаги выполнения (артефакты решения)

| Шаг ДЗ | Документ / файл |
| ------ | --------------- |
| 1. Infrastructure as Code | [docs/delivery-pipeline.md](docs/delivery-pipeline.md) §1 · [docs/terraform-sketch.tf](docs/terraform-sketch.tf) |
| 2. CI/CD Pipeline | [diagrams/cicd-mlops-pipeline.png](diagrams/cicd-mlops-pipeline.png) · [docs/delivery-pipeline.md](docs/delivery-pipeline.md) §2 |
| 3. MLOps Integration | Схема (нижний контур) · [docs/delivery-pipeline.md](docs/delivery-pipeline.md) §3 |
| 4. Release Strategy (Canary) | [docs/delivery-pipeline.md](docs/delivery-pipeline.md) §4 |

## Формат сдачи

| Артефакт | Путь |
| -------- | ---- |
| Схема CI/CD + MLOps | [diagrams/cicd-mlops-pipeline.drawio](diagrams/cicd-mlops-pipeline.drawio) · [PNG](diagrams/cicd-mlops-pipeline.png) |
| Описание IaC / пайплайнов / Canary | [docs/delivery-pipeline.md](docs/delivery-pipeline.md) |
| Псевдокод Terraform | [docs/terraform-sketch.tf](docs/terraform-sketch.tf) |

## Критерии самопроверки

| Критерий | Как закрыто |
| -------- | ----------- |
| Интеграция | App image + `model_uri` / `index_version` из Model Registry — [§3](docs/delivery-pipeline.md), [схема](diagrams/cicd-mlops-pipeline.png) |
| Безопасность релиза | Unit → Staging → E2E/Eval → Canary 1%→5%→100% + rollback-метрики — [§2, §4](docs/delivery-pipeline.md) |
| Автоматизация | Terraform + GitOps (Argo CD) + Airflow→Registry→CD; ручной только optional prod gate — [§1–3](docs/delivery-pipeline.md) |

Статус «Принято», если все три критерия выполнены.

## Полезные материалы

| Материал | Описание |
| -------- | -------- |
| [Argo CD — Architectural Overview](https://argo-cd.readthedocs.io/en/stable/operator-manual/architecture/) | API Server, Repo Server, Application Controller |
| [Canary Release (Martin Fowler)](https://martinfowler.com/bliki/CanaryRelease.html) | Постепенный rollout и rollback трафика |

## Компетенции

Планировать и организовывать надёжную инфраструктуру для AI-систем, включая CI/CD и отказоустойчивость:

- писать Terraform-конфигурации для базовой инфраструктуры (VPC, Kubernetes, S3);
- проектировать схемы MLOps-пайплайнов для RAG с автоматическим обновлением векторной базы;
- разрабатывать планы релиза AI-сервисов со стратегией Canary.
