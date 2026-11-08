# Cheat Sheet — General Architecture Questions

> Universal interview topics for a **Solution / Enterprise Architect**. RetailPartnerX case: [INTERVIEW-SUMMARY.md](INTERVIEW-SUMMARY.md).

---

## The Solution Architect Role

| Does | Does not do (usually) |
|--------|---------------------|
| Connects business goals and the technical solution | Write all the product code |
| Defines system boundaries, NFRs, risks | Replace the product owner in feature prioritization |
| Chooses the integration style and API contracts | Choose the client's budget without a trade-off |
| Documents decisions (C4, ADR) | Offer a "silver bullet" without context |

**Answer formula:** context → constraints → options → trade-off → recommendation → risks.

---

## C4 Model (Levels)

| Level | Question | Audience |
|---------|--------|-----------|
| **C1 Context** | Who does the system interact with outside? | Business, stakeholders |
| **C2 Container** | Which deployable parts does it consist of? | Development, DevOps |
| **C3 Component** | How does one container work inside? | Service team |
| **C4 Code** | Classes/modules (rare in interviews) | Developers |

**Sequence** — one scenario over time; **Deployment** — what runs where (K8s, regions).

---

## NFR — Non-Functional Requirements

Always clarify the **metric and SLO**, not "it should be fast".

| Attribute | Example metrics | Levers |
|---------|----------------|--------|
| **Performance** | p95 latency, RPS, throughput | Cache, indexes, async, CDN |
| **Scalability** | Horizontal scaling under load | Stateless, queues, sharding |
| **Availability** | Uptime %, MTTR, RTO/RPO | Replicas, health checks, DR |
| **Reliability** | Error rate, idempotency | Retry with backoff, circuit breaker |
| **Security** | OWASP, encryption, audit | IAM, mTLS, secrets manager |
| **Maintainability** | Time to deploy, MTTR | Observability, IaC, ADR |
| **Cost** | Cost per request / TB | Right-sizing, serverless vs always-on |

**SLA** — a promise to the client; **SLO** — an internal target; **SLI** — the measured indicator.

---

## Monolith vs Microservices

| | Monolith / modular monolith | Microservices |
|--|---------------------------|--------------|
| **When** | MVP, small domain, one team | Several teams, independent releases, different scale |
| **Pros** | Simple deployment, transactions, debugging | Failure isolation, per-service scaling |
| **Cons** | Codebase growth, coupling | Network, distributed transactions, observability |
| **In an interview** | "I will start with clear modules and extract a service when the pain of the boundary exceeds the pain of the network" | |

**Modular monolith** — one deployment with strict module boundaries (often a sensible answer for an MVP).

---

## Synchronous vs Asynchronous

| Synchronous (REST/gRPC) | Asynchronous (queue, event bus) |
|---------------------|-------------------------------|
| An immediate response is needed (UI, checkout) | Delay is acceptable (analytics, retrain, email) |
| Simpler for the client | Loose coupling, buffers peaks |
| Cascading failures along a chain | Harder: idempotency, ordering, DLQ |

**Pattern:** sync on the critical user path + async for everything else.

---

## APIs and Integrations

| Topic | In short |
|------|---------|
| **REST** | Resources, HTTP verbs, error codes, versioning (`/v1`) |
| **Contract** | OpenAPI is the source of truth for Backend ↔ service |
| **Idempotency** | A repeated POST does not duplicate the effect (`Idempotency-Key`) |
| **Versioning** | URL or header; breaking change → new major version |
| **BFF** | Backend for Frontend — aggregates calls for the UI |
| **Anti-corruption layer** | An adapter between your model and legacy/PIM |

**Integrations:** API (online), events (reactive), batch/ETL (reports, offline ML).

---

## Data

| Question | Direction of the answer |
|--------|-------------------|
| SQL vs NoSQL | SQL — transactions, relations; NoSQL — flexible schema, huge volume, KV/document |
| Cache | Redis: hot data, sessions, recommendation cache; TTL + invalidation |
| CQRS | Separate read/write models under different loads |
| Event sourcing | History as a stream of events (complex, not a default) |
| CAP | A distributed system cannot have everything at once; choose CP or AP per scenario |
| ACID vs BASE | Bank/order — ACID; highly available analytics — eventual consistency |

---

## Reliability and Fault Tolerance

| Pattern | Essence |
|---------|------|
| **Timeout** | Do not wait forever on a hung call |
| **Retry** | Only on idempotent calls / with a limit |
| **Circuit breaker** | Fail fast when a dependency degrades |
| **Bulkhead** | Pool isolation (one service must not bring everything down) |
| **Graceful degradation** | No recommendations — show popular items, not a 500 |
| **Health check** | Liveness / readiness for the orchestrator |

---

## Security (Basics)

- **Authentication** — who you are (OAuth2, OIDC, JWT).
- **Authorization** — what you may do (RBAC, ABAC).
- **Secrets** — not in the code; vault / env at runtime.
- **Personal data** — minimization, encryption at rest / in transit, consent, retention period.
- **Defense in depth** — perimeter + network + application + audit.

---

## Observability

| Pillar | Why |
|-------|-------|
| **Logs** | Post-factum incident analysis |
| **Metrics** | Alerts, SLOs, dashboards |
| **Traces** | The request chain across microservices |

**Three questions in an incident:** what broke → when → what changed (deployment, config, load).

---

## ADR — Architecture Decision Record

A short template (1 page per decision):

1. **Context** — what the problem is  
2. **Decision** — what we chose  
3. **Alternatives** — what we rejected  
4. **Consequences** — pros, cons, debt  

It shows maturity: decisions are deliberate, not "that's how it's done".

---

## Typical Interview Questions — Answer Templates

**How do you design a system from scratch?**  
Stakeholders → use cases → NFR → C1/C2 → critical path → PoC of risky areas → API/data → roadmap.

**How do you choose between X and Y?**  
Criteria from the NFRs and the team → 2–3 options → trade-off table → decision + what we will revisit in N months.

**How do you ensure scalability?**  
Measure the bottleneck first; stateless app; cache; read replicas; async; only then sharding.

**How do you migrate legacy?**  
Strangler fig — a new layer around the old one; domain by domain; dual write / read only when needed.

**What is good architecture?**  
It solves the business problem within the constraints; it is changeable and observable; the team can maintain it.

**Where does AI fit in the architecture?**  
A separate service with a contract; offline training / online inference; drift monitoring; a fallback without the model; compliance for personal data.

---

## Anti-Patterns (Worth Naming)

- **Big ball of mud** — no module boundaries  
- **Distributed monolith** — microservices with tight coupling and a shared DB  
- **Resume-driven architecture** — Kafka/K8s "because it's trendy"  
- **Golden hammer** — one stack for everything  
- **Architecture without NFRs** — "we drew some nice boxes"

---

## Requirement Red Flags (What to Ask)

- No KPIs / Definition of Done  
- "Like Amazon" without volume or budget  
- All NFRs maxed out at once (fast, cheap, 100% uptime)  
- Unclear owner of data and integrations  
- An FP contract under high uncertainty  

---

## Before the Interview (2 Minutes)

- [ ] One **trade-off** example from your experience (even an educational case)  
- [ ] Draw **C2** from memory: client → UI → API → service → DB  
- [ ] Name 3 **NFRs** with metrics (latency, availability, security)  
- [ ] One reliability pattern (circuit breaker / graceful degradation)  
- [ ] Open [INTERVIEW-SUMMARY.md](INTERVIEW-SUMMARY.md) — in case they ask about an AI project
