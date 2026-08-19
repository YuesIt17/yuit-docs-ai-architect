# Глоссарий hw-5

Термины data pipeline и Feature Store для RetailPartnerX. PIM, CDP, SKU — в [hw-1/Glossary.md](../hw-1/Glossary.md); Vector DB, embedding, Ranker — в [hw-2/Glossary.md](../hw-2/Glossary.md).

| Термин | Расшифровка | Кратко |
|--------|-------------|--------|
| **ETL** | Extract, Transform, Load | Извлечение → очистка/трансформация → загрузка в хранилище |
| **ELT** | Extract, Load, Transform | Сначала посадка в Lake, тяжёлая трансформация уже там |
| **Lambda** | Lambda architecture | Batch + stream + общий serving-слой |
| **Kappa** | Kappa architecture | Единый stream-поток вместо отдельного batch |
| **CDC** | Change Data Capture | Инкрементальная выгрузка изменений (напр. SKU из PIM) |
| **Data Lake** | — | Дешёвое объектное хранилище сырья и curated-слоёв (S3) |
| **Feature Store** | — | Реестр признаков: offline для train, online для инференса |
| **Training-Serving Skew** | — | Расхождение признаков/логики между обучением и продом |
| **Point-in-time join** | — | Join признаков на момент события без leakage из будущего |
| **Kafka** | — | Брокер сообщений для stream-событий поведения |
| **Spark** | Apache Spark | Batch и Structured Streaming: очистка, агрегаты, ELT |
| **Online store** | — | Низколатентный кэш признаков (Redis) для Ranker |
| **Offline store** | — | Исторические признаки в Lake для обучения модели |
| **Embedding pipeline** | — | Offline batch: текст SKU → векторы → Vector DB |
| **ANN** | Approximate Nearest Neighbor | Быстрый поиск похожих эмбеддингов в Vector DB |
| **Materialization** | — | Расчёт и запись признаков в Feature Store по расписанию / stream |
| **Drift** | Data / concept drift | Сдвиг распределений данных или поведения → деградация модели |
