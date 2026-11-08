# hw-5 Glossary

Terms for the data pipeline and Feature Store for RetailPartnerX. PIM, CDP, SKU are in [hw-1/Glossary.md](../hw-1/Glossary.md); Vector DB, embedding, Ranker are in [hw-2/Glossary.md](../hw-2/Glossary.md).

| Term | Expansion | In short |
|--------|-------------|--------|
| **ETL** | Extract, Transform, Load | Extract → clean/transform → load into storage |
| **ELT** | Extract, Load, Transform | Land in the Lake first; heavy transformation happens there |
| **Lambda** | Lambda architecture | Batch + stream + a shared serving layer |
| **Kappa** | Kappa architecture | A single stream instead of a separate batch |
| **CDC** | Change Data Capture | Incremental export of changes (e.g. SKUs from PIM) |
| **Data Lake** | — | Cheap object storage for raw data and curated layers (S3) |
| **Feature Store** | — | A feature registry: offline for training, online for inference |
| **Training-Serving Skew** | — | A mismatch of features/logic between training and production |
| **Point-in-time join** | — | Joining features as of the event time, with no leakage from the future |
| **Kafka** | — | A message broker for behavior stream events |
| **Spark** | Apache Spark | Batch and Structured Streaming: cleaning, aggregates, ELT |
| **Online store** | — | A low-latency feature cache (Redis) for the Ranker |
| **Offline store** | — | Historical features in the Lake for model training |
| **Embedding pipeline** | — | Offline batch: SKU text → vectors → Vector DB |
| **ANN** | Approximate Nearest Neighbor | Fast search for similar embeddings in the Vector DB |
| **Materialization** | — | Computing and writing features to the Feature Store on a schedule / stream |
| **Drift** | Data / concept drift | A shift in data or behavior distributions → model degradation |
