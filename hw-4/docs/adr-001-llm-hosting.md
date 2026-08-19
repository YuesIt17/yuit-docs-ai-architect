# ADR-001: LLM hosting for RetailPartnerX shopping assistant

- **Status:** Accepted
- **Date:** 2026-07-19
- **Deciders:** Solution Architect (интегратор), согласование с CTO RetailPartnerX
- **Related:** [llm-hosting-comparison.md](llm-hosting-comparison.md) · [cto-pitch.md](cto-pitch.md) · риски R6/R7 в [hw-1](../../hw-1/RetailPartnerX_AI_Strategy.md)

## Context

RetailPartnerX внедряет персональный шопинг-ассистент в чате мобильного приложения ([hw-3](../../hw-3/README.md)): мультиагентный RAG-пайплайн с вызовами LLM (парсинг ограничений, синтез ответа, policy verdict).

В архитектуре AI Service уже выделен **LLM Client** ([hw-2](../../hw-2/diagrams/README.md)) — точка интеграции с моделью. Нужно решить, **где** исполняется inference:

1. **SaaS** — проприетарная облачная frontier LLM по API.
2. **Self-hosted** — Open-Source модель (напр. Llama 3) на GPU в контуре заказчика/интегратора.

Ограничения: этап **PoC/MVP**, регуляторика **GDPR / 152-ФЗ**, NFR по **p95 latency**, риски **R6** (ПДн), **R7** (vendor lock-in). Подробное сравнение критериев — в [llm-hosting-comparison.md](llm-hosting-comparison.md).

## Decision

На этапе **PoC и MVP** используем **SaaS LLM** (облачная frontier-модель) через **LLM Client** с абстракцией провайдера:

- контракт с провайдером включает **DPA** и условия по обработке данных;
- в промпты и логи не передаём сырые персональные идентификаторы (минимизация ПДн);
- интерфейс LLM Client допускает смену бэкенда (feature-flag / adapter) без переписывания агентов;
- **Self-hosted (Llama 3 и аналоги)** остаётся в плане развития (**roadmap**) как опция при: (а) требовании юридического отдела (Legal) хранить данные только у себя (**data residency**) или запрете облачной LLM; (б) себестоимости облачного токена (**unit-cost**) выше порога полной стоимости владения своим железом (**TCO on-prem**); (в) стабильно высокой загрузке видеокарт (**утилизация GPU**).

Конкретный бренд модели (GPT / Claude / др.) не фиксируется в ADR — фиксируется **класс решения: SaaS via LLM Client**.

## Alternatives considered

| Альтернатива | Почему не выбрана сейчас |
| ------------ | ------------------------ |
| Self-hosted Llama 3 (day-1) | CapEx GPU + MLOps на низкой нагрузке пилота; риск худшего качества агентов; дольше TTM |
| Гибрид SaaS + локальная малая модель | Усложняет MVP без доказанной экономии; отложено до prod-оптимизации |

## Consequences

### Pros

- Быстрый TTM пилота без закупки и настройки GPU-кластера.
- Лучшее качество instruction following / structured output для агентов hw-3.
- Операционная нагрузка на SLA вендора; команда фокусируется на RAG, политиках и продукте.
- Согласуется с митигацией R7 из стратегии: абстракция провайдера + self-hosted в roadmap.

### Cons (trade-offs)

- **Vendor lock-in (R7):** зависимость от цен, квот и изменений API — митигируется LLM Client и критериями пересмотра выше.
- **Остаточный риск Privacy (R6):** данные промптов обрабатываются вне периметра; DPA и минимизация ПДн не равны on-prem.
- **Стоимость при масштабе:** при росте трафика OpEx за токены может превысить TCO Self-hosted (см. [a16z](https://a16z.com/navigating-the-high-cost-of-ai-compute/)).
- **Внешний latency-хвост:** p95 зависит от сети и очередей провайдера — компенсируется Top-K/кэшем из hw-2 и бюджетом таймаутов.
