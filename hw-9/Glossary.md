# hw-9 Glossary

Terms for **high-load, caching, KEDA and async** for the RetailPartnerX AI Service.  
Latency budget / Redis candidates — [hw-2/Glossary.md](../hw-2/Glossary.md).  
GPU sizing — [hw-7/Glossary.md](../hw-7/Glossary.md).  
K8s / GitOps — [hw-8/Glossary.md](../hw-8/Glossary.md).

Document: [high-load-architecture.md](docs/high-load-architecture.md).

---

## Load and Latency

### RPS (Requests Per Second)

The number of requests per second at the service entry. The hw-9 target is on the order of **10 000 RPS** (total across channels; not equal to LLM RPS).

### p95 latency

The 95th percentile of response time: 95% of requests are faster than the threshold. For the RetailPartnerX sync path in hw-9: **&lt; 200 ms**.

### Sync hot path

The synchronous product page path (`/get_recommendation`), which must meet the latency SLO.

### Async heavy path

Queued processing of heavy requests (shopping assistant, long RAG/LLM); the client gets a `job_id` and does not wait for completion within one HTTP &lt;200 ms call.

---

## Caching

### Multi-tier cache

Several cache levels in a row: CDN → API Gateway → Redis (candidates) → Semantic Cache → LLM.

### Semantic Cache

A cache of LLM responses by the **vector similarity** of the query (and context window), not by an exact string key. See [Microsoft Learn](https://learn.microsoft.com/en-us/azure/cosmos-db/gen-ai/semantic-cache).

### Similarity score (θ)

A vector similarity score in [0..1]. The threshold θ in the WHERE clause of the vector query: a hit only if score ≥ θ.

### Context Window (for the Cache)

The sliding history of user/assistant messages embedded together with the latest query, so that the cache is contextually correct.

### Cache hit / miss

Hit — a response from the cache with no (or minimal) LLM; miss — the full pipeline + a cache write.

---

## Scaling

### Horizontal scaling

Adding pod replicas (AI API / Inference) rather than vertically growing one machine.

### HPA (Horizontal Pod Autoscaler)

The standard Kubernetes autoscaler by CPU/memory/custom metrics — for the sync API layer.

### KEDA

Kubernetes Event-driven Autoscaler: scales a Deployment/Job by external events (queue length, lag, etc.). Site: [keda.sh](https://keda.sh/).

### ScaledObject

A KEDA CRD: links a Deployment to a trigger (Redis/Kafka/Service Bus…) and a min/max replicas policy.

### Inference worker

A pod running LLM/vLLM or a heavy agent pipeline; scaled by KEDA based on the queue.

### Warm pool

A minimum number of GPU/inference replicas (`minReplicaCount` &gt; 0) to avoid a cold start at peak.

---

## Event-Driven / Async

### EDA (Event-Driven Architecture)

An architecture where components react to events/messages in a queue, not only to synchronous RPC.

### Request Queue

A job queue (Redis Streams / Kafka / Service Bus) between the API and the Inference workers.

### Competing Consumers

Several worker pods compete for queue messages; scale ≈ throughput.

### Backpressure

Protection against overload: 503 / retry-after / refusing heavy jobs so as not to bring down the sync path.

### DLQ (Dead Letter Queue)

A queue of "poison" messages after retries are exhausted — for analysis without blocking the main queue.

---

## Global / Edge

### Geo-DNS

DNS routing of a user to the nearest/optimal region by geography or latency.

### Edge computing

Lightweight logic and cache at the network edge (CDN PoP): lookup, static content, segment responses — no full LLM at the edge.

### Origin

The central (or regional) backend / AI API where a cache miss from the edge goes.

---

## Abbreviations and Labels from the Diagram

Terms from [high-load-architecture.drawio](diagrams/high-load-architecture.drawio) / PNG that were missing above.  
More on RAG / Ranker / recsys / SKU — [hw-2/Glossary.md](../hw-2/Glossary.md); PII / Guardrails — [hw-6/Glossary.md](../hw-6/Glossary.md); vLLM — [hw-7/Glossary.md](../hw-7/Glossary.md).

### NFR (Non-Functional Requirements)

Non-functional requirements: RPS, latency, availability, etc. On the diagram — the block with 10k RPS and p95 &lt; 200 ms.

### CDN (Content Delivery Network)

A network of points of presence (PoPs) at the edge: serves static content and a short cache of "hot" responses closer to the user.

### SKU (Stock Keeping Unit)

A product accounting unit (article). *Hot SKU cache* — a cache of popular product pages / recommendations by SKU.

### API Gateway

The entry gateway: auth/rate limit, optional response cache, routing to sync recsys or async assistant.

### rate limit

Limiting the number of requests from a client/key so that a peak does not take down the AI Service.

### ingress

Incoming traffic at the system edge (CDN / Gateway), before internal pods.

### recsys (Recommender System)

A recommender system. On the diagram, the **recsys sync** edge = the synchronous `/get_recommendation` path.

### Ranker + Top-K

ML/rules narrow the candidates to Top-K before the (expensive) LLM/response. See latency budget A-001 in hw-2.

### candidates / features

Precomputed candidates and features in Redis for the Ranker (not the Semantic Cache).

### Soft degrade / fallback

A simplified response on LLM failure/timeout: Ranker only, without the full LLM path — to keep the SLO.

### Jobs API · job_id · HTTP 202

The async assistant entry: an immediate **202 Accepted** + a job identifier; the result comes later via poll/push.

### SB (Service Bus)

A message broker (e.g. Azure Service Bus) as a Request Queue option alongside Redis Streams / Kafka.

### queue length / depth metric

Queue depth (how many messages await processing) — the trigger metric for KEDA.

### consume

A worker takes (consumes) a message from the queue.

### enqueue

The Jobs API puts a job into the queue.

### lookup

Searching the Semantic Cache by the query vector (+ context window): checking for a hit before RAG/LLM.

### store

Writing the completion to the Semantic Cache after a successful LLM call (usually after guardrails).

### miss (on Diagram Edges)

1) CDN → Gateway: not in the edge cache.  
2) Semantic Cache → RAG: no suitable vector hit (see Cache hit / miss).

### prompt

The assembled context (RAG + history) goes to the LLM Client.

### complete

The worker has finished the job and writes the result to the Result Store.

### Result Store

A store of async job statuses/responses (Redis/SQL, etc.) for poll or push to the client.

### webhook / SSE

**Webhook** — an HTTP callback to the client on completion. **SSE** (Server-Sent Events) — a stream of events from the server. An alternative to polling (**poll**).

### poll / push

The client asks for the status itself (**poll**) or the server delivers the result (**push**: webhook/SSE).

### RAG (Retrieval-Augmented Generation)

Retrieval over the Product/Policy KB + LLM generation. On the diagram — after a Semantic Cache miss.

### KB (Knowledge Base)

Knowledge base: Product KB + Policy KB (hw-3/5).

### LLM / LLM Client / SaaS / self-host

A large language model; accessed through the LLM Client abstraction (hw-4) — cloud SaaS or our own instance.

### vLLM

An LLM inference engine with batching/KV paging — in the Inference Workers (hw-7).

### PII (Personally Identifiable Information)

Personal data. On the diagram: the Security Layer masks/filters it before a cache write.

### Guardrails

Input/output constraints (injection, toxicity, policy) before the reply reaches the user and before a cache write.

### guarded write

Writing to the Semantic Cache only after passing the Security Layer (PII + Output Guardrails).

### Observability · hit-rate · metrics

Monitoring: cache hit share, queue depth, p95, etc. (hw-6); the **metrics** edge is telemetry from the workers.

### HTTPS

Encrypted HTTP from the client to the CDN/Gateway.

---

## Quick Index

| Term | In one phrase |
| ------ | ------------ |
| 10k RPS / &lt;200 ms | Target sync path NFRs |
| CDN / Edge / Geo-DNS / SKU | Network edge and hot SKU cache |
| recsys sync | Sync `/get_recommendation` |
| Ranker + Top-K / candidates | Narrow sync path without the full LLM |
| Soft degrade / fallback | Ranker-only on timeout |
| lookup / store / miss | Semantic Cache search, write and miss |
| enqueue / consume / complete | Put in the queue → take → done |
| Jobs API · 202 · job_id | Async accept without waiting for the LLM |
| SB / Kafka / Redis Streams | Request Queue options |
| queue length / depth metric | KEDA trigger |
| Result Store · poll / push · SSE | How the client gets the async response |
| RAG / KB / prompt | Miss → retrieval → LLM |
| vLLM / warm GPU | Inference workers |
| PII / Guardrails / guarded write | Safe cache write |
| KEDA / ScaledObject / HPA | Scaling by queue / by CPU·RPS |
| Backpressure | Do not kill sync during an LLM peak |
