# Interview Summary — Solution Architect (AI / Retail)

> A short cheat sheet on the **RetailPartnerX** case (hw-1 + hw-2). Full artifacts: [hw-1](../hw-1/RetailPartnerX_AI_Strategy.md), [hw-2](../hw-2/README.md).  
> General architecture topics: [ARCHITECTURE-INTERVIEW-CHEATSHEET.md](ARCHITECTURE-INTERVIEW-CHEATSHEET.md).

---

## 30 Seconds — Who I Am and What the Case Is About

Solution architect at an integrator. The client is an FMCG retailer that wants personal recommendations "like Tesco / X5", without KPIs or data boundaries. My task: **remove uncertainty**, choose a **stage-by-stage contract**, cover **AI risks** and deliver the **architecture + API** for integration.

---

## Client Context

| | |
|--|--|
| **Business** | International grocery / FMCG, omnichannel |
| **Goal** | Personalized SKU recommendations |
| **Problem** | Vague requirements, no success metrics, unknown data quality |
| **External landscape** | PIM (catalog), CDP/CRM (events), loyalty (customer ID) |
| **Regulation** | GDPR, 152-FZ, consent for personal data |

---

## My Approach (3 Pillars)

1. **Discovery** — 5–7 questions for the client (KPIs, channels, data, cold start, systems, NFR, governance).
2. **Staged delivery** — PoC → MVP → Production (~10 months), a measurable DoD at each stage.
3. **Contract matched to risk** — not pure FP at the start; a hybrid after the hypothesis is tested.

---

## Contract Model (What to Say in an Interview)

| Stage | Model | Why |
|------|--------|--------|
| **PoC** (4–6 weeks) | **T&M with cap** | High uncertainty; we pay for testing a hypothesis, not for a "black box" |
| **MVP** | **Hybrid:** FP for integration/UI + T&M for ML/data | Predictability for the "boxed" part, flexibility where the model iterates |
| **Production** | Framework **FP + SLA + retainer** | MLOps, retrain, scale |

**CR triggers (examples):** a new event source, a KPI change, >2 touchpoints, catalog growth >30%, latency tightened by >20%.

---

## Roadmap and DoD (Brief)

| Milestone | Timing | Success (DoD) |
|------|------|-------------|
| Discovery | wk 0–2 | PoC charter, answer matrix |
| PoC | wk 3–8 | Offline metrics (NDCG@10, HitRate@10) vs baseline → **go/no-go** |
| MVP | mo 3–6 | 1 channel in prod, A/B or shadow, KPI monitoring |
| Production | mo 7–10 | All touchpoints, MLOps, SLO (latency, uptime) |

**MVP scenario in the architecture:** the "Frequently bought together" block on the **product page**.

---

## Architecture (hw-2)

### C2 — Containers

`Customer` → **Frontend** → **Backend (BFF)** → **AI Service**  
In parallel: Backend ↔ **SQL DB**, AI Service ↔ **SQL** + **Redis**; catalog from **PIM**; **Vector DB** — optional / future RAG.

### C3 — AI Service (MVP = recsys, Not RAG)

The synchronous request chain:

`Controller` → `Router` → `Loader` → `Ranker` → `Builder` → response  
Data: **Redis** (candidate cache), **SQL** (history).

**Future (Prod):** a separate C3 with RAG Manager, LLM Client, Prompt Factory, Vector DB — **not in the MVP Sequence/API**.

### API

`POST /get_recommendation` — Backend → AI Service  
Body: `user_id`, `context` (product_page / checkout), `product_id`, `limit`  
Target **p95 latency ~250 ms**; codes 400 / 404 / 503 / 500.

---

## Top AI Risks (What I Remember Without Notes)

| Risk | Mitigation |
|------|-----------|
| Poor/incomplete events | Data audit in the PoC, unified customer ID |
| Cold start (user/SKU) | Popularity + content-based fallback |
| Model drift | Offline/online monitoring, retrain procedure |
| Irrelevant recommendations | Blocklists, filters, human-in-the-loop in the pilot |
| Latency at peak | Redis cache, autoscaling, load tests |
| Compliance (GDPR/152-FZ) | Privacy review, personal data minimization, DPIA |
| GenAI (future) | Guardrails, no auto-publishing, provider abstraction |

---

## Questions I Will Ask the Interviewer / Client

- Which **primary KPI** closes the PoC? (CTR, conversion, AOV, share of revenue from the block)
- Where is the **first touchpoint** in the MVP — only the product page, or also cart/push?
- Is there a **unified ID** between online and offline?
- Which **NFRs**: p95 latency, SLA, explainability?
- Who is the **product owner** and how do we accept A/B results?

---

## Typical Interview Questions — Short Answers

**Why not FP from day one?**  
There are no fixed KPIs, and the data and algorithm are unverified — FP would lead to CR wars.

**Why recsys in the MVP and not LLM/RAG?**  
Lower risk (hallucinations, latency, cost); the value of FMCG recsys is proven by classic ranking; RAG is a Prod stage with an explicit use case.

**How is the Backend independent of ML details?**  
OpenAPI contract + BFF; inside the AI Service, Loader/Ranker are replaceable without changing the API.

**What is the PoC go/no-go?**  
Offline metrics on a hold-out ≥ baseline **or** an explicit no-go with reasons (data, coverage).

---

## Artifacts in the Repository

| What | Where |
|-----|-----|
| Strategy, contract, risks, roadmap | [hw-1/RetailPartnerX_AI_Strategy.md](../hw-1/RetailPartnerX_AI_Strategy.md) |
| C4 + Sequence (Draw.io) | [hw-2/diagrams/](../hw-2/diagrams/) |
| OpenAPI | [hw-2/openapi/recommendation-api.yaml](../hw-2/openapi/recommendation-api.yaml) |
| Terms (C4, NFR, metrics) | [hw-2/Glossary.md](../hw-2/Glossary.md) |
| HTML presentation of the case | [GitHub Pages](https://yuesit17.github.io/yuit-docs-ai-architect/portfolio/) |

---

## Before the Meeting (Checklist)

- [ ] Say out loud: PoC/MVP/Prod contract + one risk with its mitigation  
- [ ] Draw C2 on a whiteboard (5 containers) and the request path to the Ranker  
- [ ] Recall one question for the client and one CR trigger  
- [ ] Open the Sequence + an OpenAPI fragment in case of a deep dive
