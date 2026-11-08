# hw-2 Architecture — RetailPartnerX

A short description of the work done: **what was designed, why this way, and how the artifacts connect**.

Case: [RetailPartnerX_AI_Strategy.md](../../hw-1/RetailPartnerX_AI_Strategy.md) · terms: [Glossary.md](../Glossary.md)

---

## Context

**Assignment:** a multi-level architecture of an AI recommendation service — C4 (C1–C3), Sequence, OpenAPI for the Backend ↔ AI Service integration.

**MVP scope:** the "Frequently bought with" block on the **product page** (`context=product_page`). Checkout is described in the API, but the main scenario in the diagrams is the SKU page.

**NFR:** synchronous Backend ↔ AI Service response; the quality metric is **p95 latency** (see below). A specific millisecond threshold is **not set** in hw-1 — the architecture leaves headroom for a tight latency budget (Ranker → Top-K → LLM).

---

## NFR: Where p95 Comes From and What "95" Means

**Source of the term:** [RetailPartnerX_AI_Strategy.md](../../hw-1/RetailPartnerX_AI_Strategy.md) — the Production NFR/SLO list *latency (p95)* and *p95 latency* monitoring; the definition is in [hw-1/Glossary.md](../../hw-1/Glossary.md) (*95th percentile latency*).

**What p95 is:** the time within which **95% of requests** complete; the remaining 5% are the "tail" (slow outliers). It is neither the average nor "every request", but common SLA/SLO practice in production: the average hides rare slowdowns, and p99 is often too strict for an MVP.

**Why it is in hw-2:** the block on the product page waits for the response synchronously → the architecture (cache, SQL, Top-K, short LLM) is designed to control the latency **tail**, not just the "average case".

### Assumption A-001 (latency budget)

| | |
|---|---|
| **Context** | hw-1 has the NFR class "p95 latency", but **no number** in ms for the MVP |
| **Assumption** | The design assumes a **synchronous** call "as part of rendering the product page"; the numeric SLO is agreed with the client at the MVP stage (PoC measurements, A/B) |
| **Consequence for the architecture** | The LLM does not run on the whole catalog — only on the Top-K after the Ranker; Redis holds precomputed candidates |

*We deliberately do not fix the number "250 ms" in the artifacts: it would be an invented threshold with no measurements.*

---

## Summary

The designed system consists of the Frontend, Backend, **AI Service**, SQL DB and Vector DB. The Backend calls the AI Service via **`POST /get_recommendation`**. Inside the AI Service is a **recsys + LLM** pipeline: classic candidate selection (Loader, Ranker) and semantic re-ranking (RAG, Prompt, LLM).

---

## Submission Artifacts

| Artifact | File | Question it answers |
|----------|------|----------------------------|
| C1 | [c1-context.drawio](c1-context.drawio) | System boundaries and external integrations |
| C2 | [c2-containers.drawio](c2-containers.drawio) | Which deployable parts make up the solution |
| C3 | [c3-ai-service-recsys.drawio](c3-ai-service-recsys.drawio) | How the AI Service works inside |
| Sequence | [sequence-get-recommendation.drawio](sequence-get-recommendation.drawio) | One user scenario step by step |
| OpenAPI | [recommendation-api.yaml](../openapi/recommendation-api.yaml) | Backend → AI Service contract |

**Submission format:** a link to `hw-2/diagrams/` (4 `.drawio` files) + the OpenAPI YAML.

---

## Key Decisions

### 1. AI Service as a Separate Container (C2)

| | |
|---|---|
| **Context** | Recommendations are a distinct ML/LLM workload with their own release cycle and SLA |
| **Decision** | The Backend orchestrates the UI and catalog; the AI Service is a separate REST service |
| **Consequences** | (+) independent deployment and scaling of AI; (−) requires an explicit API contract and service-to-service auth |

### 2. Hybrid Ranker + LLM (C3)

| | |
|---|---|
| **Context** | Running the full catalog through the LLM is expensive and slow; the NFR is a synchronous block on the product page, with the **p95** metric from the hw-1 strategy (see the NFR section above) |
| **Decision** | The **Ranker** (ML pre-score) narrows the list to Top-K → **RAG + LLM** re-rank a small set with the product page context |
| **Consequences** | (+) latency and cost under control (assumption A-001); (+) co-purchase data and history are preserved; the Ranker is a module inside the AI Service, not a separate container |

### 3. A Single Integration Endpoint (OpenAPI)

| | |
|---|---|
| **Context** | The assignment requires a Backend ↔ AI Service specification |
| **Decision** | `POST /get_recommendation`, Bearer JWT; request: `user_id`, `context`, `product_id`, `limit`; response: `recommendations[]` |
| **Consequences** | Backend and QA can work against the contract before the whole pipeline is ready; errors: **400, 401, 404, 503, 500** (messages in English) |

### 4. Consistency of C3 ↔ Sequence ↔ OpenAPI

| | |
|---|---|
| **Context** | The assignment criterion: C3 components must match the Sequence steps |
| **Decision** | The Sequence uses the same AI Service components as C3; the Backend → Controller call is the operation in OpenAPI |
| **Consequences** | Check: every C3 block has a lifeline in the Sequence; the `POST /get_recommendation` step is the Backend → AI Service arrow on C2 |

### 5. The "Pure RAG" Template Is Outside the MVP

| | |
|---|---|
| **Context** | The assignment text lists Controller, RAG Manager, LLM Client, Prompt Factory |
| **Decision** | The educational RAG-only drawing is moved to [_dev/templates/](_dev/templates/); the working C3 is **recsys + LLM** |
| **Consequences** | The submission contains one consistent C3, with no duplication |

---

## MVP Scenario (Happy Path)

1. The customer opens the **SKU-123** product page.
2. Frontend → Backend: product data.
3. Backend → **Rec. Controller**: `POST /get_recommendation` (`user_id=1002847`, `context=product_page`).
4. The **Router** determines the scenario; the **RAG Manager** gets the product context from the **Vector DB**.
5. The **Loader** takes candidates from **Redis** and features from the **SQL DB**.
6. **Ranker** → Top-K → **Prompt Factory** (+ RAG context) → **LLM Client** → **Response Builder**.
7. Response with `recommendations[]` → UI: the "Frequently bought with" block.

---

## Consistency Map (C3 = Sequence)

| C3 | Sequence |
|----|----------|
| Recommendation Controller | Rec. Controller |
| Scenario Router | Scenario Router |
| Candidate Loader | Candidate Loader |
| Ranker | Ranker |
| RAG Manager | RAG Manager |
| Prompt Template Factory | Prompt Factory |
| LLM Client | LLM Client |
| Response Builder | Response Builder |
| SQL DB / Redis / Vector DB | SQL DB / Redis / Vector DB |

**C2:** C3 components are not drawn; only the Frontend, Backend, AI Service, SQL DB and Vector DB are visible.

---

## Outside the Submission Scope

| Path | Purpose |
|------|------------|
| [_dev/](_dev/) | JSON layout specs, Draw.io generator |
| [_dev/templates/](_dev/templates/) | RAG example from the assignment text |

---

## Quick Self-Check Before Submitting

- [ ] C2: five containers, Backend → AI Service is labeled `get_recommendation`
- [ ] C3 and Sequence: identical AI Service component names
- [ ] OpenAPI: request/response examples, codes 400 / 401 / 404 / 503 / 500
- [ ] C2 and C3 levels are not mixed on one diagram
