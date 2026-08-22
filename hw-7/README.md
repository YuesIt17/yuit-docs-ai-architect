# Домашнее задание hw-7 — RetailPartnerX

**Sizing: расчёт ресурсов инфраструктуры и стоимости инференса**

> **Сокращения:** [Глоссарий](Glossary.md) · **Артефакты:** [docs/](docs/)

## Цель

Рассчитать ресурсы и стоимость инференса LLM под заданную нагрузку и выбрать оптимальную конфигурацию оборудования с учётом оптимизаций (квантование, batching, vLLM).

## Контекст и преемственность

| ДЗ | Артефакт | Связь с hw-7 |
| -- | -------- | ------------ |
| [hw-1](../hw-1/RetailPartnerX_AI_Strategy.md) | Стратегия, roadmap PoC→MVP→Prod | Capacity planning на этапе роста нагрузки |
| [hw-2](../hw-2/diagrams/README.md) | AI Service, LLM Client, NFR latency | Бюджет latency влияет на concurrent = RPM × latency |
| [hw-3](../hw-3/README.md) | Multi-agent RAG shopping assistant | Основной потребитель LLM-токенов в чате |
| [hw-4](../hw-4/docs/adr-001-llm-hosting.md) | ADR: SaaS для PoC/MVP, self-hosted в roadmap | hw-7 — **TCO-оценка self-hosted Llama-3-70B** как триггер пересмотра ADR |
| [hw-5](../hw-5/docs/data-pipeline.md) | Data plane | Не входит в GPU-инференс; стоимость data plane отдельно |
| [hw-6](../hw-6/docs/quality-assurance.md) | Observability | Метрики GPU util / queue depth для проверки sizing |

**Задача:** для RetailPartnerX оценить self-hosted инференс **Llama-3-70B** (FP16 и INT4) при **1000 RPM** — VRAM/GPU, стоимость в Yandex / Cloud.ru / AWS / GCP, эффект Batching и vLLM.

Тема курса сохранена; расчёт привязан к shopping assistant и ADR-001 (self-hosted как опция при росте unit-cost).

## Шаги выполнения (артефакты решения)

| Шаг ДЗ | Документ / файл |
| ------ | --------------- |
| 1. Hardware Sizing | [docs/inference-sizing.md](docs/inference-sizing.md) §2–4 |
| 2. Cloud Selection | [docs/inference-sizing.md](docs/inference-sizing.md) §5–6 |
| 3. Optimization | [docs/inference-sizing.md](docs/inference-sizing.md) §7 |
| 4. Вывод | [docs/recommendation.md](docs/recommendation.md) · TL;DR в sizing |

## Формат сдачи

| Артефакт | Путь |
| -------- | ---- |
| Расчёты (Markdown) | [docs/inference-sizing.md](docs/inference-sizing.md) |
| Краткий вывод | [docs/recommendation.md](docs/recommendation.md) |

**Ссылка для сдачи (после пуша в `main`):**  
https://github.com/YuesIt17/yuit-docs-ai-architect/blob/main/hw-7/docs/inference-sizing.md

На GitHub Markdown рендерится с таблицами «из коробки». Отдельный HTML / Google Sheets не нужны. Портфолио на Pages (`/portfolio/`) не пересекается с этим путём.

## Критерии самопроверки

| Критерий | Как закрыто |
| -------- | ----------- |
| Точность VRAM | Weights + KV Cache + overhead — [§2](docs/inference-sizing.md) |
| Сравнение облаков | Yandex, Cloud.ru, AWS, GCP — [§5–6](docs/inference-sizing.md) |
| Оптимизация | INT4 + Batching/vLLM — [§7](docs/inference-sizing.md) |

## Полезные материалы

| Материал | Описание |
| -------- | -------- |
| [LLM Model VRAM Calculator](https://huggingface.co/spaces/NyxKrage/LLM-Model-VRAM-Calculator) | Калькулятор VRAM |
| [Yandex Cloud Compute pricing](https://yandex.cloud/en/docs/compute/pricing) | Прайс GPU (A100, T4) |
| [Cloud.ru GPU](https://cloud.ru/products/vychislitelnyye-moschnosti-s-gpu) | Аренда A100 и др. |
| [AWS EC2 on-demand](https://aws.amazon.com/ec2/pricing/on-demand/) | P4d / G6 / G4dn |
| [GCP accelerator pricing](https://cloud.google.com/products/compute/pricing/accelerator-optimized) | A2 / G2 |
| [Hugging Face: Llama 3.1 memory](https://huggingface.co/blog/llama31) | FP16/INT4 веса + KV |

## Компетенции

Планировать инфраструктуру AI: детальный расчёт ресурсов on-prem/cloud и выбор GPU-конфигурации для хостинга LLM.
