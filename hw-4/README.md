# Assignment hw-4 — RetailPartnerX

**Recording architecture decisions (ADR) and preparing to defend them**

> **Abbreviations:** [Glossary](Glossary.md) · **Artifacts:** [docs/](docs/)

## Goal

Record the architecture decision on how to host the LLM (SaaS vs Self-hosted) in ADR format to justify it to technical leadership (CTO).

## Context and Continuity

| Assignment | Artifact | Link to hw-4 |
| --------------------------------------------- | ------------------------------ | --------------------------------------------------------- |
| [hw-1](../hw-1/RetailPartnerX_AI_Strategy.md) | AI recommendation strategy | Risks R6 (personal data), R7 (vendor lock-in), R8 (hallucinations) |
| [hw-2](../hw-2/diagrams/README.md) | C4, Sequence, OpenAPI | LLM Client in the AI Service, p95 latency / NFR |
| [hw-3](../hw-3/README.md) | Multi-agent RAG assistant | The chat assistant depends on the LLM; a model/hosting choice is needed |

**Task:** for RetailPartnerX (a personal shopping assistant in the app chat), choose where to host the LLM: a proprietary cloud model (SaaS, e.g. GPT) or an open-source model (e.g. Llama 3) on our own servers (Self-hosted).

The topic replaces the abstract "any project" template while keeping the assignment structure (analysis → ADR → pitch).

## Steps (Solution Artifacts)

| Assignment step | Document / file |
| ------------------- | ------------------------------------------------------------------------------- |
| 1. Criteria analysis | [docs/llm-hosting-comparison.md](docs/llm-hosting-comparison.md) — Cost, Privacy, Quality, Latency, Support |
| 2. Decision + ADR | [docs/adr-001-llm-hosting.md](docs/adr-001-llm-hosting.md) — Title, Status, Context, Decision, Consequences (Pros/Cons) |
| 3. CTO pitch | [docs/cto-pitch.md](docs/cto-pitch.md) — 1 paragraph on why the decision is right under current conditions |

## Submission Format

| Artifact | Path |
| -------------------------------- | ---------------------------------------------------------------------- |
| SaaS vs Self-hosted comparison | [docs/llm-hosting-comparison.md](docs/llm-hosting-comparison.md) |
| ADR (Markdown)                   | [docs/adr-001-llm-hosting.md](docs/adr-001-llm-hosting.md)             |
| CTO pitch | [docs/cto-pitch.md](docs/cto-pitch.md) |

ADR templates: [architecture-decision-record](https://github.com/architecture-decision-record/architecture-decision-record) · [MADR](https://adr.github.io/madr/).

## Self-Check Criteria

| Criterion | How it is met |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| ADR structure | Standard format: Title, Status, Context, Decision, Consequences — [docs/adr-001-llm-hosting.md](docs/adr-001-llm-hosting.md) |
| Reasoning | The choice is backed by facts (criteria table) — [docs/llm-hosting-comparison.md](docs/llm-hosting-comparison.md) |
| Honesty | Consequences list the downsides and trade-offs of the decision |

Status "Accepted" if all three criteria are met.

## Useful Materials

| Material | Description |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| [Architecture Decision Record](https://github.com/architecture-decision-record/architecture-decision-record) | Overview of the ADR practice |
| [MADR](https://adr.github.io/madr/) | Markdown template for Architectural Decision Records |
| [Cloud vs On-prem LLM costs (a16z)](https://a16z.com/navigating-the-high-cost-of-ai-compute/) | Cloud vs on-prem compute costs |

## Competencies

Develop, document and verify the architecture of AI solutions at different levels of detail:

- write Architecture Decision Records (ADRs) to justify key architecture decisions;
- defend architecture decisions with reasoned arguments (self-check / review preparation).
