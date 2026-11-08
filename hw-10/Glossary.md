# hw-10 Glossary

Terms for **Model Card, fairness and FinOps** for the RetailPartnerX AI system.  
Risks R1–R8 — [hw-1/Glossary.md](../hw-1/Glossary.md).  
GPU OpEx — [hw-7/Glossary.md](../hw-7/Glossary.md).  
Observability / Langfuse — [hw-6/Glossary.md](../hw-6/Glossary.md).

Document: [model-card-and-finops.md](docs/model-card-and-finops.md).

---

## Governance / Model Card

### Model Card

A short document accompanying a model (or AI system): purpose, limitations, data, metrics, ethical risks. In the spirit of [Mitchell et al., 2018](https://arxiv.org/abs/1810.03993) and the [HF Hub](https://huggingface.co/docs/hub/model-cards).

### Intended Use

The stated scenarios for applying the model, for which there is a quality evaluation and owner accountability.

### Out-of-scope / Limitations

Scenarios and conditions in which the model should **not** be used (or used only with a human in the loop).

### Bias

A systematic shift in predictions/recommendations across user groups, SKU categories or channels, often due to skewed training data.

### Fairness metrics

Metrics comparing the quality of/access to recommendations across segments (for example, coverage by region, long-tail exposure, demographic parity proxy).

### Decision audit log

A structured record of "why the system gave this answer": model versions, retrieval hits, policy verdict, filters — for compliance and incidents.

### Popularity bias

The tendency of a recommender to pull traffic toward already popular SKUs at the expense of the long tail.

---

## FinOps

### FinOps

An operational practice and culture that maximizes the business value of technology through shared responsibility across Engineering / Finance / Product ([FinOps Framework](https://www.finops.org/framework/)).

### Cost Optimization

A set of technical and process measures to reduce or stabilize OpEx without an unacceptable loss of quality/SLO.

### Spot Instance (preemptible)

A discounted cloud GPU/CPU with interruption risk; suitable for batch/train/async, not for the only sync hot path without a fallback.

### Model Distillation

Training a smaller (student) model to imitate a larger (teacher) model to reduce latency and GPU cost on simple tasks.

### TTL (Time To Live)

The lifetime of data/logs/cache; after expiry the object is deleted or moved to cold storage.

### Unit economics (AI)

Cost per unit of value: ₽ / recommendation, ₽ / chat turn, ₽ / 1k tokens.

### Budget overrun

The actual bill is above the approved budget for the period (in the hw-10 scenario: **+50%**).

### Right-sizing

Matching the size of the model/instance to the actual task (do not run 70B for Top-K ranking).

---

## Related Abbreviations from Earlier Assignments

| Term | Where defined |
| ------ | ------------- |
| Ranker / Top-K / LLM re-rank | hw-2 |
| Policy Analyst / Product KB | hw-3 |
| INT4 + vLLM / A100 OpEx | hw-7 |
| Semantic Cache / KEDA | hw-9 |
| Faithfulness / Langfuse | hw-6 |
