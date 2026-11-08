# Assignment hw-9 — RetailPartnerX

**Architecture for high load and real-time processing**

> **Abbreviations:** [Glossary](Glossary.md) · **Artifacts:** [docs/](docs/) · [diagrams/](diagrams/)

## Goal

Design a high-load architecture for the RetailPartnerX real-time AI service with caching, horizontal scaling and asynchronous processing for **10 000 RPS** and **latency &lt; 200 ms** (synchronous path).

## Context and Continuity

| Assignment | Artifact | Link to hw-9 |
| -- | -------- | ------------ |
| [hw-1](../hw-1/RetailPartnerX_AI_Strategy.md) | NFR: p95 latency, Prod roadmap | Numeric SLO: 10k RPS, &lt;200 ms on the sync path |
| [hw-2](../hw-2/diagrams/README.md) | Ranker → Top-K → LLM; Redis candidates; A-001 | Latency budget baseline; multi-tier cache on top of Redis |
| [hw-3](../hw-3/README.md) | Multi-agent shopping assistant | Heavy requests → async queue; Semantic Cache by context window |
| [hw-4](../hw-4/docs/adr-001-llm-hosting.md) | LLM Client abstraction | The cache and queue do not change the LLM client contract |
| [hw-5](../hw-5/docs/data-pipeline.md) | Feature Store / Vector DB | Embeddings for the Semantic Cache + Product KB |
| [hw-6](../hw-6/docs/quality-assurance.md) | Observability | Hit rate, queue depth, p95 metrics — KEDA / rollback triggers |
| [hw-7](../hw-7/docs/recommendation.md) | 2×A100 INT4 + vLLM @ 1000 RPM | Inference pods = a scalable pool on top of the sizing |
| [hw-8](../hw-8/docs/delivery-pipeline.md) | K8s + GitOps + Canary | The platform for KEDA ScaledObject / Deployments |

**Task:** the service has grown — it must withstand **10 000 RPS** at **Latency &lt; 200 ms** using a Semantic Cache, queue-based KEDA and queue-based async for heavy requests.

The course topic is preserved; the patterns are tied to `/get_recommendation` (sync) and the shopping assistant (async/heavy).

## Steps (Solution Artifacts)

| Assignment step | Document / file |
| ------ | --------------- |
| 1. Caching Strategy | [docs/high-load-architecture.md](docs/high-load-architecture.md) §1 |
| 2. Scaling (KEDA) | [docs/high-load-architecture.md](docs/high-load-architecture.md) §2 · [diagram](diagrams/high-load-architecture.png) |
| 3. Async Processing | [docs/high-load-architecture.md](docs/high-load-architecture.md) §3 |
| 4. Global Distribution (optional) | [docs/high-load-architecture.md](docs/high-load-architecture.md) §4 |

## Submission Format

| Artifact | Path |
| -------- | ---- |
| High-Load architecture diagram | [diagrams/high-load-architecture.drawio](diagrams/high-load-architecture.drawio) · [PNG](diagrams/high-load-architecture.png) |
| Explanatory note on the patterns | [docs/high-load-architecture.md](docs/high-load-architecture.md) |

## Self-Check Criteria

| Criterion | How it is met |
| -------- | ----------- |
| Adequacy of measures | Semantic Cache + Ranker/Top-K cut LLM RPS — [§1](docs/high-load-architecture.md), conclusions in [§5.1](docs/high-load-architecture.md) |
| Scalability | HPA sync + queue-based KEDA + backpressure — [§2–3](docs/high-load-architecture.md), conclusions in [§5.2](docs/high-load-architecture.md), [diagram](diagrams/high-load-architecture.png) |
| Latency | CDN / Edge / Redis / Semantic Cache + split async — [§1, §3, §4](docs/high-load-architecture.md), conclusions in [§5.3](docs/high-load-architecture.md) |

Status "Accepted" if all three criteria are met.

## Useful Materials

| Material | Description |
| -------- | -------- |
| [Semantic Cache — Azure Cosmos DB](https://learn.microsoft.com/en-us/azure/cosmos-db/gen-ai/semantic-cache) | Vector cache of LLM queries/completions |
| [KEDA](https://keda.sh/) | Event-driven autoscaling in Kubernetes |

## Competencies

Apply advanced architecture patterns for scaling, real-time and hybrid environments:

- justify the choice of orchestration (Kubernetes + KEDA vs pure Serverless);
- design an EDA for reactive processing of heavy AI requests;
- design a high-load, low-latency service (cache, Edge).
