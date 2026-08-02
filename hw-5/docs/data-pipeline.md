# Data Pipeline — RetailPartnerX

**Проект:** персонализированные рекомендации + шопинг-ассистент  
**Этап:** MVP  
**Схема:** [diagrams/data-pipeline.drawio](../diagrams/data-pipeline.drawio) · [PNG](../diagrams/data-pipeline.png)  
**Паттерн:** Lambda-подобная схема (batch каталог + stream поведение → общий serving)

Связь с предыдущими ДЗ: риск **R1** ([hw-1](../../hw-1/RetailPartnerX_AI_Strategy.md)); PIM / CDP / Vector DB / Ranker ([hw-2](../../hw-2/diagrams/README.md)); Product KB ([hw-3](../../hw-3/docs/rag-pipeline.md)).

## 1. Data Sources

| Источник | Тип | Сущности | SLA обновления | Потребитель downstream |
| -------- | --- | -------- | -------------- | ---------------------- |
| **App / CDP** | Stream | `view`, `click`, `add_to_cart`, `purchase`; `customer_id`, `sku_id`, `ts` | Near-real-time (секунды–минуты) | Feature Store (онлайн-агрегаты), offline train |
| **PIM / ERP** | Batch (ночной + CDC при изменении SKU) | `sku_id`, название, категория, атрибуты, аллергены, остатки | Nightly full + CDC deltas | Data Lake → curated catalog → embeddings / SQL |
| **CMS / Legal** (опц.) | Batch | Policy-документы | По релизу политик | Vector DB коллекция `policies` (hw-3) |

Единый `customer_id` и контракт событий — митигация **R1** (качество поведенческих данных).

## 2. Pipeline Design

### Поток (ETL / ELT)

1. **Ingest**
   - Stream: App/CDP → **Kafka** (топики `events.click`, `events.purchase`, …).
   - Batch: PIM/ERP → выгрузка / API → **Spark batch**.
2. **Clean / transform** (граница Spark)
   - Валидация schema, дедуп, отсев ботов, нормализация `customer_id` / `sku_id`.
   - Stream: Spark Structured Streaming → агрегаты (CTR-окна, co-view).
   - Batch: raw → curated catalog в Lake.
3. **Load**
   - Curated + агрегаты → **S3 Data Lake** (ELT: тяжёлая трансформация после посадки raw).
   - Feature materialization → **Feature Store** (offline в Lake, online в Redis).
   - Embedding batch (после curated catalog) → **Vector DB** (Product KB).
4. **Serve**
   - AI Service **Ranker** читает online features + при необходимости Vector DB.
   - RAG-агенты hw-3 читают Product KB (не пересчитывают эмбеддинги на запросе).

**Где очистка:** Spark (stream + batch).  
**Где эмбеддинги:** offline batch-job после curated catalog — **не** в online path `POST /get_recommendation`.

## 3. Storage Selection

| Слой | Технология | Зачем |
| ---- | ---------- | ----- |
| Event bus | **Kafka** | Буфер stream-событий; развязка App/CDP и обработчиков; replay |
| Compute | **Spark** (batch + Structured Streaming) | Единый стек Stream vs Batch; очистка и агрегаты |
| Data Lake | **S3** (raw + curated) | Дешёвое хранение сырья и истории для retrain / audit |
| Feature Store | Offline (Lake/Parquet) + **Redis** online | Одни feature definitions для train и serve |
| Vector DB | **Pinecone** (или pgvector/Qdrant из hw-2/3) | ANN-поиск эмбеддингов SKU для RAG / semantic re-rank |
| Online cache | **Redis** | p95 latency Ranker (precomputed кандидаты / features), см. hw-2 |

Стек end-to-end: **Kafka → Spark → S3 → Feature Store / Pinecone**.

## 4. Data Governance (Training-Serving Skew)

| Мера | Как закрыто |
| ---- | ----------- |
| Единые feature definitions | Один реестр признаков (имя, тип, окно агрегации); offline и online считают по одной логике |
| Point-in-time joins | При обучении — join признаков **на момент события**, без «заглядывания» в будущее |
| Версии эмбеддингов | `index_version` / model id в метаданных Vector DB; rollback индекса без даунтайма Ranker |
| Свежесть online store | TTL и backfill из offline; алерты на lag Kafka → Redis |
| Drift / качество | Мониторинг полноты событий и распределения признаков (R1); data audit из PoC |

**Итог:** Feature Store — не «ещё одно хранилище», а контракт между offline-обучением Ranker и online-инференсом на карточке товара / в чате.

> **Сокращения:** [Глоссарий](../Glossary.md)
