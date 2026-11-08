# Glossary of Abbreviations

Reference of terms and abbreviations used in the multi-level design assignment materials (C4 Model, diagrams, OpenAPI).

---

## C4 Model and Abstraction Levels

| Abbreviation | Expansion | In short |
| --------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **C4** | Context, Containers, Components, Code | A method for visualizing architecture at four levels of detail |
| **C1** | Context diagram | The system in its environment: users, external systems, boundaries |
| **C2** | Container diagram | Large deployable units: services, DBs, frontend, and the links between them |
| **C3** | Component diagram | The internal structure of one container (modules, layers) |
| **C4 (Code)** | Code diagram | The class/module level of code; rarely used at the architecture description stage |
| **Context Diagram** | Context diagram | Same as C1: "who interacts with whom" around the system |
| **Container Diagram** | Container diagram | Same as C2: the applications and stores in the system |
| **Component Diagram** | Component diagram | Same as C3: detail inside the chosen container |
| **Sequence Diagram** | Sequence diagram | The order of messages/calls between participants over time |
| **LLD** | Low-Level Design | Low-level design: C3, API, integration contracts |
| **HLD** | High-Level Design | High-level architecture (often C1–C2) |
| **NFR** | Non-Functional Requirements | Non-functional requirements: latency, SLA, security, compliance (see also [hw-1](../hw-1/Glossary.md)) |
| **deployable unit** | Deployable unit | In C4, a "container" is a separately deployed application or DB, **not** a Docker container |
| **happy path** | Successful scenario | The main chain without errors — enough for one Sequence diagram |

---

## Method Notes on the Diagrams

One system is drawn at **different "zoom levels"** (like a map: country → city → house). Each level has its own objects; **do not mix** the user, modules inside the AI Service and DB tables in one picture.

**How the artifacts connect:** C2 (containers) → C3 (inside the AI Service) → Sequence (one scenario over time) → OpenAPI (Backend ↔ AI Service contract). Participant and component names must **match** across diagrams.

### C4 Levels — Which Question Each Answers

| Level | Question | What we draw (RetailPartnerX) | What we do not draw |
| ------- | ------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------- |
| **C1** | Who is outside and what is the system connected to? | Customer, PIM, CRM, one "Recommendation system" block | PostgreSQL, classes, endpoints |
| **C2** | Which **large** parts does our system consist of? | Frontend, Backend, AI Service, Vector DB, SQL DB | Controller, RAG Manager inside AI |
| **C3** | What does **one** container (AI Service) consist of? | Controller, RAG Manager, LLM Client, etc. | The whole Frontend as an AI "component" |
| **C4** | Classes and code | — | **Rarely required** at the architecture description stage |

### C1 — Context (Context Diagram)

**Audience:** the client, a manager, project participants without an architecture background.

A rectangle is your system; around it are **people** and **external** systems (PIM, payments). Arrows carry labels: "views recommendations", "receives the catalog". C1 is often drawn separately as a "cover" before C2.

### C2 — Container

**Audience:** architect, backend, DevOps.

Each block is a **separately deployed** application or store. Arrows are **network calls** (REST, gRPC), not an abstract "data flows".

Example chain: `Customer → Frontend → Backend → AI Service`; the Backend and AI Service connect to their own DBs.

**Typical mistake:** drawing the RAG Manager on C2 — that is already **C3**.

### C3 — Component

**Rule:** "zoom in" on one rectangle from C2 (usually the **AI Service**) so the **modules inside** become visible.

**Audience:** AI Service developers, LLD review.

For a recsys without an LLM, the README components can be replaced with Ranker, Feature Loader, Cache — the logic is the same. External containers (Frontend, SQL DB) are **not expanded** on C3, only the "calls via API" link.

### Sequence — Sequence Diagram

| C2 / C3                        | Sequence                                  |
| ------------------------------ | ----------------------------------------- |
| **Structure** — what exists | **Scenario** — what happens step by step |
| All containers at once | One path, for example "recommendation request" |

Participants from the top down (**lifeline**): User → Frontend → Backend → AI Service → (if needed) SQL DB / Vector DB.

Example steps: opened the product page → Frontend called the Backend → Backend `POST /get_recommendation` → AI Service read the cache/features → response → the UI showed the "Frequently bought together" feed.

Every component from **C3** must appear in the chain. One **happy path** is enough; errors (503) can be a separate diagram if desired.

### HLD and LLD

|                     | HLD                                      | LLD                         |
| ------------------- | ---------------------------------------- | --------------------------- |
| Meaning | What it consists of and how it connects | How we implement and integrate |
| Usually | C1, C2, NFR (latency, SLA, security) | C3, Sequence, OpenAPI |
| Architecture package | C2 (+ C1 if desired) | C3 + Sequence + OpenAPI |

### Cheat Sheet: What Goes on Which Diagram

| Element | C1 | C2 | C3 | Sequence |
| ---------------------- | :-----: | :--------------: | :------: | :---------: |
| Customer | ✓ | ✓\* | ✗ | ✓ |
| Frontend / Backend | boundary | ✓ | ✗ | ✓ |
| Whole AI Service | ✗ | ✓ | expand | ✓ |
| Controller (inside AI) | ✗ | ✗ | ✓ | ✓ |
| SQL DB | ✗ | ✓ | call | ✓ |
| `/get_recommendation` | ✗ | label on the link | ✗ | ✓ + OpenAPI |

\* the customer is sometimes omitted on C2 — the Frontend is enough.

### Recommended Set of Artifacts and Consistency

1. **C2** — 5 containers from [README.md](README.md), labels on the arrows.
2. **C3** — only the AI Service, 4–6 components.
3. **Sequence** — 8–15 steps, the same names as on C3.
4. **OpenAPI** — only the **Backend → AI Service** contract.

**Consistency check:** the Sequence step "Backend → AI Service" = the arrow on C2 = the **Controller** on C3 receives the call = the operation in OpenAPI.

### Typical Diagramming Mistakes

- Mixing the C2 and C3 levels on one diagram.
- A Sequence with 5 scenarios at once — split it into separate diagrams.
- OpenAPI for the whole site instead of the Backend ↔ AI Service integration.
- Confusing a **Container (C4)** with Docker — in C4 it is any deployable (service, DB, SPA).

---

## Containers and Components (Reference Diagram)

| Abbreviation | Expansion | In short |
| --------------------------- | ------------------------------ | --------------------------------------------------------------------- |
| **Frontend** | — | The client layer (web, mobile app) |
| **Backend** | — | The application server: orchestration, business logic, calling the AI Service |
| **AI Service** | — | Recommendation / RAG / LLM service: a separate deployable container |
| **Vector DB** | Vector Database | A DB of embeddings for semantic search (RAG, similarity) |
| **SQL DB** | Relational Database | Relational store: catalog, orders, profiles, metadata |
| **Controller** | — | The layer that receives HTTP/gRPC requests in the AI Service |
| **RAG** | Retrieval-Augmented Generation | Finding context in a knowledge base + LLM answer generation |
| **RAG Manager** | — | Retrieval orchestration: querying the Vector DB, assembling context |
| **LLM Client** | — | A client for the LLM provider (OpenAI, a local model, etc.) |
| **Prompt Template Factory** | — | Prompt templates: building the system/user prompt from parameters |
| **Ranker** | — | An alternative to an LLM in recsys: ranking candidates by a model/rules |
| **Feature Loader** | — | Loading user/product features from a cache or feature store |
| **embedding** | — | A vector representation of text/a product for search in the Vector DB |

---

## Client External Systems (RetailPartnerX)

| Abbreviation | Expansion | In short |
| ---------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **PIM** | Product Information Management | The master product catalog: **SKU**, attributes, stock. An **external** client system (gray block on C1/C2), not part of the "Recommendation system". The Backend loads the catalog via **REST/API**; it is not expanded on C3 or the Sequence |

---

## API and Specifications

| Abbreviation | Expansion | In short |
| ---------------------- | --------------------------------- | ------------------------------------------------------------- |
| **API** | Application Programming Interface | The interaction contract between services |
| **OpenAPI** | — | The standard for describing REST APIs (formerly Swagger Specification) |
| **Swagger** | — | The ecosystem/editors around OpenAPI; the specification is YAML/JSON |
| **REST** | Representational State Transfer | API style: resources, HTTP methods, response codes |
| **endpoint** | — | An API access point, for example `POST /get_recommendation` |
| **request / response** | — | Request and response body and headers; defined by schemas in OpenAPI |
| **schema** | JSON Schema (in OpenAPI) | Field types, required fields, examples in the specification |
| **HTTP status codes** | — | 200, 400, 404, 500, etc. — must be described in the API Spec |
| **YAML** | YAML Ain't Markup Language | The OpenAPI specification file format |
| **JSON** | JavaScript Object Notation | An alternative format for the specification or examples |
| **Petstore** | Swagger Petstore | An educational OpenAPI example to use as a structural reference |

---

## Integration and Interaction

| Abbreviation | Expansion | In short |
| ------------------------ | ---------------- | ----------------------------------------------------------------------- |
| **sync call** | Synchronous call | The Backend waits for the AI Service response within one user request |
| **async** | Asynchronous | Response via a queue/callback (separate lifelines on the Sequence diagram) |
| **lifeline** | — | A participant on the Sequence diagram (actor, service, DB) |
| **message** | — | A call/response arrow between participants on the sequence diagram |
| **integration contract** | — | The agreed API + data models between the Backend and AI Service |

---

## AI / ML (in the Architecture Context)

| Abbreviation | Expansion | In short |
| ----------------- | ----------------------- | ----------------------------------------------------------------- |
| **AI** | Artificial Intelligence | The AI service in the system (recommendations, RAG) |
| **LLM** | Large Language Model | A large language model (called from the LLM Client) |
| **recsys** | Recommender System | A recommender system — the subject of the "recommendation request" scenario |
| **inference** | — | Getting a prediction/recommendation from the model at runtime |
| **hallucination** | — | Unreliable LLM output; a risk when designing RAG and prompts |

---

## Tools

| Abbreviation | Expansion | In short |
| --------------- | ---------------- | ----------------------------------------------- |
| **Draw.io** | app.diagrams.net | A diagram editor (C2, C3, Sequence) |
| **Structurizr** | — | A tool and DSL for C4 diagrams |
| **Holst** | — | An online whiteboard for diagrams and collaboration |
| **Gist** | GitHub Gist | Hosting an OpenAPI fragment (YAML/JSON) by link |

---

## Link to the hw-1 Glossary (Common Terms)

Terms for the **PoC**, **MVP**, **Production** stages, **T&M**, **FP** contracts, **NDCG**, **KPI** metrics, as well as **CDP**, **CRM**, **CMS**, etc., are in the [Glossary.md](../hw-1/Glossary.md) of the first assignment.

---

_Version: 1.2 — added the "Client External Systems (RetailPartnerX)" section with the PIM term_
