# Assignment hw-6 — RetailPartnerX

**End-to-end quality assurance: testing, security and observability**

> **Abbreviations:** [Glossary](Glossary.md) · **Artifacts:** [docs/](docs/) · [diagrams/](diagrams/)

## Goal

Design a quality assurance framework for the RetailPartnerX AI system, including security (PII / Guardrails), RAG testing and observability with AI metrics.

## Context and Continuity

| Assignment | Artifact | Link to hw-6 |
| -- | -------- | ------------ |
| [hw-1](../hw-1/RetailPartnerX_AI_Strategy.md) | AI strategy, risks R4/R6/R8 | Toxic recommendations, GDPR/personal data, genAI hallucinations |
| [hw-2](../hw-2/diagrams/README.md) | C4, Sequence, OpenAPI | AI Service, `POST /get_recommendation` — the point where guardrails are installed |
| [hw-3](../hw-3/README.md) | Multi-agent RAG assistant | Policy Analyst + RAG; strengthening the Security Layer on the chat path |
| [hw-4](../hw-4/README.md) | ADR: LLM hosting | Model comparison → RAG eval plan; Secret Manager for keys |
| [hw-5](../hw-5/docs/data-pipeline.md) | Data pipeline / Vector DB | Product KB freshness affects Faithfulness / Context Recall |

**Task:** for RetailPartnerX (recommendations + shopping assistant), complete the **Security → RAG Testing → Observability** loop so that the MVP can safely go to prod with measurable answer quality.

The topic replaces the abstract "QA of any LLM system" template while keeping the assignment structure (Security Layer → Testing Strategy → Observability).

## Steps (Solution Artifacts)

| Assignment step | Document / file |
| ------ | --------------- |
| 1. Security Layer | [diagrams/security-layer.png](diagrams/security-layer.png) · [docs/quality-assurance.md](docs/quality-assurance.md) §1 |
| 2. Testing Strategy | [docs/quality-assurance.md](docs/quality-assurance.md) §2 — Faithfulness, Answer Relevancy, Ragas/DeepEval |
| 3. Observability | [docs/quality-assurance.md](docs/quality-assurance.md) §3 — Grafana widgets (Golden Signals + AI) |

## Submission Format

| Artifact | Path |
| -------- | ---- |
| Security diagram | [diagrams/security-layer.drawio](diagrams/security-layer.drawio) · [PNG](diagrams/security-layer.png) |
| Document: security + test plan + dashboard | [docs/quality-assurance.md](docs/quality-assurance.md) |

## Self-Check Criteria

| Criterion | How it is met |
| -------- | ----------- |
| Security | Prompt Injection (Input Guard) + personal data leaks (PII Sanitizer) — [diagram](diagrams/security-layer.png), [§1](docs/quality-assurance.md) |
| Metrics | Faithfulness / Answer Relevancy (not CPU) + AI dashboard widgets — [§2–3](docs/quality-assurance.md) |
| Tooling | Prometheus, Tempo, Langfuse, Ragas/DeepEval — [§2–3](docs/quality-assurance.md) |

Status "Accepted" if all three criteria are met.

## Useful Materials

| Material | Description |
| -------- | -------- |
| [OWASP Top 10 for LLM](https://owasp.org/www-project-top-10-for-large-language-model-applications/) | Prompt Injection, Sensitive Information Disclosure, Improper Output Handling |
| [Grafana dashboard examples](https://grafana.com/grafana/dashboards/) | References for Golden Signals widgets |

## Competencies

Design and implement quality assurance (QA), fault tolerance and information security mechanisms in the architecture of an AI system at all stages of its lifecycle:

- develop test plans for comparing different LLM models in RAG tasks;
- "strengthen" the architecture of AI agents with security components (sanitizer, validator, secret manager);
- design Grafana dashboards for monitoring the key SLOs of AI services.
