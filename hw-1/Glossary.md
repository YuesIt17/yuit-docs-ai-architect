# Glossary of Abbreviations

Reference of terms and abbreviations used in the AI recommendations project materials (assignment, RetailPartnerX strategy, risks, roadmap).

---

## Contracts and Commercials

| Abbreviation | Expansion | In short |
|------------|-------------|--------|
| **T&M** | Time & Materials | Payment for actual effort: hours × rate (+ expenses if needed) |
| **T&M with cap** | T&M with a ceiling | T&M with a hard limit on budget and/or time |
| **FP** | Fixed Price | A fixed amount for an agreed scope |
| **FP + T&M** | Hybrid model | FP for the predictable part (integrations, UI); T&M for ML/data iterations |
| **FP + SLA + retainer** | FP + SLA + retainer | Framework FP for the platform; SLA for the service level; the retainer is a regular payment for support (retrain, MLOps) |
| **SOW** | Statement of Work | Description of work: scope, timing, deliverables, acceptance criteria |
| **CR** | Change Request | A request to change scope/timing/budget outside the original FP |
| **cap** | ceiling | Upper limit of budget or time (in T&M with cap) |

---

## Project Stages and Management

| Abbreviation | Expansion | In short |
|------------|-------------|--------|
| **PoC** | Proof of Concept | Testing a hypothesis on limited data/scenarios |
| **MVP** | Minimum Viable Product | A minimal product with real users (often 1 channel) |
| **Prod / Production** | Production | Production operation, scale, MLOps |
| **DoD** | Definition of Done | Stage completion criteria (acceptance checklist) |
| **go/no-go** | go / no-go decision | The decision to continue or stop the project after the PoC |
| **Discovery** | — | The uncertainty-removal phase (workshop, questions, charter) |
| **baseline** | — | A reference for comparison (rule-based, old model, competitor) |
| **parity** | — | Parity with the baseline: no worse, no statistically significant gain |
| **lift** | — | Metric increase relative to control (A/B) |
| **ISAR** | (course template) | Format of a quantitative risk register (probability %, min/expected/max damage) |

---

## Recommender System Metrics (Offline / PoC)

| Abbreviation | Expansion | In short |
|------------|-------------|--------|
| **NDCG@k** | Normalized Discounted Cumulative Gain @ k | Top-k ranking quality; relevant items higher is better; normalized 0…1 |
| **NDCG@10** | NDCG for the top 10 | A standard recsys metric in the PoC DoD |
| **HitRate@k** | Hit Rate @ k | Share of cases with ≥1 relevant item in the top k |
| **HitRate@10** | Hit Rate for the top 10 | A simple threshold of "the model guesses at least something" in the top 10 |
| **coverage** | — | Share of users/SKUs that receive personal recommendations |
| **hold-out** | — | A held-out sample for offline evaluation with no leakage from train |
| **offline metrics** | — | Evaluation on historical data before/alongside production |
| **online metrics** | — | Metrics in production (A/B, business KPIs) |
| **cold start** | — | The user or SKU has no history — fallback strategies are needed |
| **recsys** | Recommender System | A recommender system |

---

## Business Metrics and Experiments

| Abbreviation | Expansion | In short |
|------------|-------------|--------|
| **KPI** | Key Performance Indicator | A key success indicator for the business |
| **CTR** | Click-Through Rate | Share of clicks on the recommendation block |
| **AOV** | Average Order Value | Average order value |
| **A/B** | A/B test | Comparing variants A and B on a share of traffic |
| **shadow mode** | — | The model computes recommendations but does not show them to the user (logs only) |

---

## NFR, Operations, MLOps

| Abbreviation | Expansion | In short |
|------------|-------------|--------|
| **NFR** | Non-Functional Requirements | Non-functional requirements: latency, SLA, security |
| **SLA** | Service Level Agreement | The agreed service level (uptime, latency, incident response) |
| **SLO** | Service Level Objective | Internal operational target metrics |
| **p95 latency** | 95th percentile latency | 95% of requests are faster than the threshold (latency tail) |
| **MLOps** | Machine Learning Operations | Retrain, drift monitoring, model versions, alerts |
| **retrain** | model retraining | Retraining the model on new data |
| **drift** | concept/data drift | Model degradation due to changes in data or behavior |
| **API** | Application Programming Interface | A programmatic interface (for example, the recommendations API) |
| **UI** | User Interface | The user interface |
| **QA** | Quality Assurance | Testing, quality control |

---

## Roles, Team, Domains

| Abbreviation | Expansion | In short |
|------------|-------------|--------|
| **ML** | Machine Learning | Machine learning / ML engineering |
| **AI** | Artificial Intelligence | Artificial intelligence (including recsys, genAI) |
| **genAI** | Generative AI | Generative AI (LLMs, descriptions, chat) |
| **LLM** | Large Language Model | A large language model |
| **PO** | Product Owner | The product owner on the client side |
| **FMCG** | Fast-Moving Consumer Goods | Everyday consumer goods (groceries, retail) |

---

## Systems and Data (Retail / Integrations)

| Abbreviation | Expansion | In short |
|------------|-------------|--------|
| **PIM** | Product Information Management | Managing the catalog and product attributes |
| **CMS** | Content Management System | Managing website/app content |
| **CDP** | Customer Data Platform | A platform for customer data |
| **CRM** | Customer Relationship Management | CRM, interaction history |
| **SKU** | Stock Keeping Unit | A product accounting unit in the catalog |
| **feature store** | — | A store of ML features in prod |

---

## Compliance and Security

| Abbreviation | Expansion | In short |
|------------|-------------|--------|
| **GDPR** | General Data Protection Regulation | The EU regulation on personal data protection |
| **152-FZ** | Federal Law No. 152-FZ "On Personal Data" | Russian legislation on personal data |
| **Personal data** | — | Data that can identify a person |
| **DPIA** | Data Protection Impact Assessment | Assessment of the impact on data protection |

---

## Risk Matrix (Qualitative Assessment)

| Abbreviation | Expansion | In short |
|------------|-------------|--------|
| **P** | Probability | Likelihood of the risk occurring |
| **I** | Impact | Severity of the consequences if it occurs |
| **L** | Low | Low probability / low impact / low priority |
| **M** | Medium | Medium level |
| **H** | High | High priority, requires active mitigation |
| **R1…R8** | Risk ID | Risk identifiers in the strategy register |

---

## Other

| Abbreviation | Expansion | In short |
|------------|-------------|--------|
| **UX** | User Experience | User experience |
| **impact** | — | The effect of a change (person-days, risk, budget) — in the CR context |

---

*Version: 1.0 — synchronized with [RetailPartnerX_AI_Strategy.md](RetailPartnerX_AI_Strategy.md)*
