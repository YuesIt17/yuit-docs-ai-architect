# Глоссарий hw-10

Термины **Model Card, fairness и FinOps** для AI-системы RetailPartnerX.  
Риски R1–R8 — [hw-1/Glossary.md](../hw-1/Glossary.md).  
GPU OpEx — [hw-7/Glossary.md](../hw-7/Glossary.md).  
Observability / Langfuse — [hw-6/Glossary.md](../hw-6/Glossary.md).

Документ: [model-card-and-finops.md](docs/model-card-and-finops.md).

---

## Governance / Model Card

### Model Card

Короткий документ, сопровождающий модель (или AI-систему): назначение, ограничения, данные, метрики, этические риски. В духе [Mitchell et al., 2018](https://arxiv.org/abs/1810.03993) и [HF Hub](https://huggingface.co/docs/hub/model-cards).

### Intended Use

Заявленные сценарии применения модели, для которых есть оценка качества и ответственность владельца.

### Out-of-scope / Limitations

Сценарии и условия, в которых модель **не** следует использовать (или использовать только с human-in-the-loop).

### Bias (предвзятость)

Систематический сдвиг предсказаний/рекомендаций относительно групп пользователей, категорий SKU или каналов, часто из-за перекоса обучающих данных.

### Fairness metrics

Метрики сравнения качества/доступа к рекомендациям между сегментами (например, coverage по регионам, long-tail exposure, demographic parity proxy).

### Decision audit log

Структурированная запись «почему система выдала этот ответ»: версии моделей, retrieval hits, policy verdict, фильтры — для compliance и инцидентов.

### Popularity bias

Склонность рекомендера перетягивать трафик на уже популярные SKU в ущерб long-tail.

---

## FinOps

### FinOps

Операционная практика и культура, максимизирующая бизнес-ценность технологий через совместную ответственность Engineering / Finance / Product ([FinOps Framework](https://www.finops.org/framework/)).

### Cost Optimization

Набор технических и процессных мер по снижению или стабилизации OpEx без неприемлемой потери качества/SLO.

### Spot Instance (preemptible)

Облачный GPU/CPU с дисконтом и риском прерывания; подходит для batch/train/async, не для единственного sync hot path без fallback.

### Model Distillation

Обучение меньшей (student) модели имитировать поведение большей (teacher), чтобы снизить latency и GPU cost на простых задачах.

### TTL (Time To Live)

Срок жизни данных/логов/кэша; после истечения объект удаляется или переносится в холодное хранилище.

### Unit economics (AI)

Стоимость на единицу ценности: ₽ / recommendation, ₽ / chat turn, ₽ / 1k tokens.

### Budget overrun

Фактический счёт выше утверждённого бюджета за период (в hw-10 сценарий: **+50%**).

### Right-sizing

Подбор размера модели/инстанса под реальную задачу (не гонять 70B на Top-K ranking).

---

## Связанные сокращения из прошлых ДЗ

| Термин | Где определён |
| ------ | ------------- |
| Ranker / Top-K / LLM re-rank | hw-2 |
| Policy Analyst / Product KB | hw-3 |
| INT4 + vLLM / A100 OpEx | hw-7 |
| Semantic Cache / KEDA | hw-9 |
| Faithfulness / Langfuse | hw-6 |
