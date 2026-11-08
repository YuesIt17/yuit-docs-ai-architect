# Assignment hw-10 — RetailPartnerX

**FinOps and Governance: managing the cost and ethics of AI**

> **Abbreviations:** [Glossary](Glossary.md) · **Artifacts:** [docs/](docs/)

## Goal

Develop a **Model Card** for the RetailPartnerX AI system and a **FinOps report** analyzing a 50% cloud budget overrun with a Cost Optimization plan.

## Context and Continuity

| Assignment | Artifact | Link to hw-10 |
| -- | -------- | ------------- |
| [hw-1](../hw-1/RetailPartnerX_AI_Strategy.md) | Risks R1–R8, GDPR/152-FZ | Bias / fairness ↔ R1, R4, R6; recommendation ethics |
| [hw-2](../hw-2/diagrams/README.md) | Ranker → Top-K → LLM | Routing: the "smart" model is not for every request |
| [hw-3](../hw-3/docs/agents.md) | Multi-agent + Policy Analyst | Intended use / limitations; audit of agent decisions |
| [hw-4](../hw-4/docs/adr-001-llm-hosting.md) | SaaS → self-hosted roadmap | Cost envelope and vendor / residency trade-offs |
| [hw-5](../hw-5/docs/data-pipeline.md) | Kafka → S3 → Feature Store | Training data, skew, TTL of logs and raw data |
| [hw-6](../hw-6/docs/quality-assurance.md) | Guardrails, Langfuse, eval | Decision audit trail; cost metrics |
| [hw-7](../hw-7/docs/inference-sizing.md) | 2×A100 INT4 + vLLM ~464k ₽/month | Base GPU OpEx for the FinOps scenario |
| [hw-8](../hw-8/docs/delivery-pipeline.md) | Canary, Model Registry | Model versions in the Model Card / registry |
| [hw-9](../hw-9/docs/high-load-architecture.md) | Semantic Cache, KEDA | Lower LLM RPS = lower OpEx |

**Task:** for RetailPartnerX (recommendations + shopping assistant), close the **Governance (Model Card + audit)** and **FinOps (overrun + optimization)** loops so that ethics and unit economics are explicit architecture artifacts rather than a "verbal agreement".

The course topic is preserved; the Hugging Face Model Cards and Mitchell et al., 2018 templates are adapted to the RetailPartnerX system rather than an abstract model on the Hub.

## Steps (Solution Artifacts)

| Assignment step | Document / file |
| ------ | --------------- |
| 1. Model Card (Intended Use, Bias, Fairness) | [docs/model-card-and-finops.md §1](docs/model-card-and-finops.md#L23) |
| 2. Audit logging of AI decisions | [docs/model-card-and-finops.md §1.6](docs/model-card-and-finops.md#L178) |
| 3. Bill analysis (+50% over budget) | [docs/model-card-and-finops.md §2.1–2.2](docs/model-card-and-finops.md#L253) |
| 4. Cost Optimization plan | [docs/model-card-and-finops.md §2.3–2.5](docs/model-card-and-finops.md#L294) |

## Submission Format

| Artifact | Path |
| -------- | ---- |
| Model Card + FinOps report with an action plan | [docs/model-card-and-finops.md](docs/model-card-and-finops.md) |

Link access is not required: the artifact is in the repository.

## Self-Check Criteria

| Criterion | How it is met |
| -------- | ----------- |
| Ethics | Model Card following the HF/Mitchell structure: use/limitations, data, bias, fairness — [§1](docs/model-card-and-finops.md#L23) |
| Economics | Specific technical measures (Spot, distillation, TTL, routing, cache) with ₽ estimates — [§2.3](docs/model-card-and-finops.md#L294) |
| Maturity | An explicit cost ↔ quality balance and when *not* to save — [§2.5](docs/model-card-and-finops.md#L346) |

Status "Accepted" if all three criteria are met.

## Useful Materials

| Material | Description |
| -------- | -------- |
| [Hugging Face — Model Cards](https://huggingface.co/docs/hub/model-cards) | Metadata + model card text |
| [Mitchell et al. — Model Cards for Model Reporting](https://arxiv.org/abs/1810.03993) | The original framework for transparent model reporting |
| [FinOps Framework](https://www.finops.org/framework/) | Principles, Domains, Capabilities (Inform → Optimize → Operate) |

## Competencies

Make architecture decisions that account for economic efficiency and strategic business goals:

- design a Model Card and the logging architecture of AI decisions for audit;
- analyze cloud bills and propose architecture changes to reduce costs.
