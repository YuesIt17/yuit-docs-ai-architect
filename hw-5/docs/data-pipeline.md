# Data Pipeline — RetailPartnerX

**Project:** personalized recommendations + shopping assistant  
**Stage:** MVP  
**Diagram:** [diagrams/data-pipeline.drawio](../diagrams/data-pipeline.drawio) · [PNG](../diagrams/data-pipeline.png)  
**Pattern:** Lambda-like design (batch catalog + stream behavior → shared serving)

Link to previous assignments: risk **R1** ([hw-1](../../hw-1/RetailPartnerX_AI_Strategy.md)); PIM / CDP / Vector DB / Ranker ([hw-2](../../hw-2/diagrams/README.md)); Product KB ([hw-3](../../hw-3/docs/rag-pipeline.md)).

## 1. Data Sources

| Source | Type | Entities | Update SLA | Downstream consumer |
| -------- | --- | -------- | -------------- | ---------------------- |
| **App / CDP** | Stream | `view`, `click`, `add_to_cart`, `purchase`; `customer_id`, `sku_id`, `ts` | Near-real-time (seconds to minutes) | Feature Store (online aggregates), offline training |
| **PIM / ERP** | Batch (nightly + CDC on SKU changes) | `sku_id`, name, category, attributes, allergens, stock | Nightly full + CDC deltas | Data Lake → curated catalog → embeddings / SQL |
| **CMS / Legal** (optional) | Batch | Policy documents | On policy release | Vector DB `policies` collection (hw-3) |

A unified `customer_id` and an event contract mitigate **R1** (behavioral data quality).

## 2. Pipeline Design

### Flow (ETL / ELT)

1. **Ingest**
   - Stream: App/CDP → **Kafka** (topics `events.click`, `events.purchase`, …).
   - Batch: PIM/ERP → export / API → **Spark batch**.
2. **Clean / transform** (Spark boundary)
   - Schema validation, deduplication, bot filtering, `customer_id` / `sku_id` normalization.
   - Stream: Spark Structured Streaming → aggregates (CTR windows, co-view).
   - Batch: raw → curated catalog in the Lake.
3. **Load**
   - Curated + aggregates → **S3 Data Lake** (ELT: heavy transformation after raw landing).
   - Feature materialization → **Feature Store** (offline in the Lake, online in Redis).
   - Embedding batch (after the curated catalog) → **Vector DB** (Product KB).
4. **Serve**
   - The AI Service **Ranker** reads online features + the Vector DB when needed.
   - The hw-3 RAG agents read the Product KB (they do not recompute embeddings per request).

**Where cleaning happens:** Spark (stream + batch).  
**Where embeddings happen:** an offline batch job after the curated catalog — **not** in the online path of `POST /get_recommendation`.

## 3. Storage Selection

| Layer | Technology | Why |
| ---- | ---------- | ----- |
| Event bus | **Kafka** | Buffer for stream events; decouples App/CDP from processors; replay |
| Compute | **Spark** (batch + Structured Streaming) | A single stack for Stream vs Batch; cleaning and aggregates |
| Data Lake | **S3** (raw + curated) | Cheap storage of raw data and history for retrain / audit |
| Feature Store | Offline (Lake/Parquet) + **Redis** online | The same feature definitions for train and serve |
| Vector DB | **Pinecone** (or pgvector/Qdrant from hw-2/3) | ANN search over SKU embeddings for RAG / semantic re-rank |
| Online cache | **Redis** | Ranker p95 latency (precomputed candidates / features), see hw-2 |

End-to-end stack: **Kafka → Spark → S3 → Feature Store / Pinecone**.

## 4. Data Governance (Training-Serving Skew)

| Measure | How it is addressed |
| ---- | ----------- |
| Unified feature definitions | One feature registry (name, type, aggregation window); offline and online compute with the same logic |
| Point-in-time joins | During training, features are joined **as of the event time**, with no "peeking" into the future |
| Embedding versions | `index_version` / model id in the Vector DB metadata; index rollback without Ranker downtime |
| Online store freshness | TTL and backfill from offline; alerts on Kafka → Redis lag |
| Drift / quality | Monitoring event completeness and feature distributions (R1); data audit from the PoC |

**Bottom line:** the Feature Store is not "yet another store" but a contract between offline Ranker training and online inference on the product page / in the chat.

> **Abbreviations:** [Glossary](../Glossary.md)
