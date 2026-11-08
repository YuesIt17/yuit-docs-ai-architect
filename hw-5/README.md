# Assignment hw-5 — RetailPartnerX

**Designing Data Pipelines and integration gateways**

> **Abbreviations:** [Glossary](Glossary.md) · **Artifacts:** [docs/](docs/) · [diagrams/](diagrams/)

## Goal

Design a data pipeline and choose storage to ensure data consistency across training and inference of the RetailPartnerX AI recommendation system.

## Context and Continuity

| Assignment | Artifact | Link to hw-5 |
| --------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------- |
| [hw-1](../hw-1/RetailPartnerX_AI_Strategy.md) | AI recommendation strategy | Risk R1 (behavioral data quality); CTR KPI; CDP / PIM in scope |
| [hw-2](../hw-2/diagrams/README.md) | C4, Sequence, OpenAPI | PIM (catalog), CDP/CRM (events), Vector DB, Ranker, `POST /get_recommendation` |
| [hw-3](../hw-3/README.md) | Multi-agent RAG assistant | Product KB / embeddings in the Vector DB need regular updates |
| [hw-4](../hw-4/README.md) | ADR: LLM hosting | LLM inference ≠ data plane; data pipelines are independent of SaaS/self-hosted |

**Task:** for RetailPartnerX (personalized recommendations + shopping assistant), ensure regular updates of data on **products** and **user behavior**, so that offline Ranker training and online inference (product page, chat) rely on consistent features and embeddings.

The topic replaces the abstract "recommendation system" template while keeping the assignment structure (sources → ETL/ELT → storage → governance).

## Steps (Solution Artifacts)

| Assignment step | Document / file |
| -------------------- | ------------------------------------------------------------------------------- |
| 1. Data Sources | [docs/data-pipeline.md](docs/data-pipeline.md) — sources (stream / batch) |
| 2. Pipeline Design | [diagrams/data-pipeline.png](diagrams/data-pipeline.png) · [docs/data-pipeline.md](docs/data-pipeline.md) — ETL/ELT flow |
| 3. Storage Selection | [docs/data-pipeline.md](docs/data-pipeline.md) — Kafka → Spark → S3 → FS / Vector DB stack |
| 4. Data Governance   | [docs/data-pipeline.md](docs/data-pipeline.md) — Training-Serving Skew |

## Submission Format

| Artifact | Path |
| ----------------------------- | ---------------------------------------------------------------------- |
| Data architecture diagram | [diagrams/data-pipeline.drawio](diagrams/data-pipeline.drawio) · [PNG](diagrams/data-pipeline.png) |
| Text description (1–2 pages) | [docs/data-pipeline.md](docs/data-pipeline.md) |

## Self-Check Criteria

| Criterion | How it is met |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| Technology choice | Stream (Kafka + Spark Streaming) vs Batch (PIM → Spark) — [docs/data-pipeline.md](docs/data-pipeline.md) |
| Flow completeness | PIM/CDP → Lake → Feature Store / Vector DB → AI Service — [diagram](diagrams/data-pipeline.png) |
| Feature Store | Offline + Redis online, unified definitions, anti-skew — [docs/data-pipeline.md](docs/data-pipeline.md) |

Status "Accepted" if all three criteria are met.

## Useful Materials

| Material | Description |
| ------------------------------------------------------------------------ | --------------------------------- |
| [Lambda/Kappa architecture example](https://bigdataschool.ru/blog/kappa-architecture/) | Batch + stream vs a single stream |

## Competencies

Design and implement quality assurance (QA), fault tolerance and information security mechanisms in the architecture of an AI system at all stages of its lifecycle:

- design fault-tolerant integrations with legacy systems through message brokers;
- design end-to-end data pipelines for AI systems, from collection to preparing data for model training.
