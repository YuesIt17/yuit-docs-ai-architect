# ADR-001: LLM hosting for RetailPartnerX shopping assistant

- **Status:** Accepted
- **Date:** 2026-07-19
- **Deciders:** Solution Architect (integrator), in agreement with the RetailPartnerX CTO
- **Related:** [llm-hosting-comparison.md](llm-hosting-comparison.md) · [cto-pitch.md](cto-pitch.md) · risks R6/R7 in [hw-1](../../hw-1/RetailPartnerX_AI_Strategy.md)

## Context

RetailPartnerX is introducing a personal shopping assistant in its mobile app chat ([hw-3](../../hw-3/README.md)): a multi-agent RAG pipeline with LLM calls (constraint parsing, reply synthesis, policy verdict).

The AI Service architecture already has a dedicated **LLM Client** ([hw-2](../../hw-2/diagrams/README.md)) as the integration point with the model. We need to decide **where** inference runs:

1. **SaaS** — a proprietary cloud frontier LLM via API.
2. **Self-hosted** — an open-source model (e.g. Llama 3) on GPUs in the client's/integrator's environment.

Constraints: the **PoC/MVP** stage, **GDPR / 152-FZ** regulation, the **p95 latency** NFR, risks **R6** (personal data) and **R7** (vendor lock-in). A detailed comparison of criteria is in [llm-hosting-comparison.md](llm-hosting-comparison.md).

## Decision

For the **PoC and MVP** stages we use a **SaaS LLM** (a cloud frontier model) through the **LLM Client** with a provider abstraction:

- the provider contract includes a **DPA** and data processing terms;
- raw personal identifiers are not passed into prompts or logs (personal data minimization);
- the LLM Client interface allows switching the backend (feature flag / adapter) without rewriting the agents;
- **Self-hosted (Llama 3 and similar)** remains on the **roadmap** as an option if: (a) Legal requires keeping data in-house (**data residency**) or prohibits a cloud LLM; (b) the cost of a cloud token (**unit cost**) exceeds the total cost of owning our own hardware (**TCO on-prem**); (c) GPU load is consistently high (**GPU utilization**).

The ADR does not fix a specific model brand (GPT / Claude / other) — it fixes the **solution class: SaaS via LLM Client**.

## Alternatives considered

| Alternative | Why it was not chosen now |
| ------------ | ------------------------ |
| Self-hosted Llama 3 (day-1) | GPU CapEx + MLOps at low pilot load; risk of lower agent quality; longer TTM |
| Hybrid SaaS + small local model | Complicates the MVP without proven savings; deferred to prod optimization |

## Consequences

### Pros

- Fast pilot TTM without buying and setting up a GPU cluster.
- Better instruction following / structured output quality for the hw-3 agents.
- Operational burden is on the vendor's SLA; the team focuses on RAG, policies and the product.
- Consistent with the R7 mitigation from the strategy: provider abstraction + self-hosted on the roadmap.

### Cons (trade-offs)

- **Vendor lock-in (R7):** dependence on prices, quotas and API changes — mitigated by the LLM Client and the review criteria above.
- **Residual Privacy risk (R6):** prompt data is processed outside the perimeter; a DPA and personal data minimization are not equal to on-prem.
- **Cost at scale:** as traffic grows, token OpEx may exceed the Self-hosted TCO (see [a16z](https://a16z.com/navigating-the-high-cost-of-ai-compute/)).
- **External latency tail:** p95 depends on the provider's network and queues — offset by the Top-K/cache from hw-2 and the timeout budget.
