# Глоссарий hw-9

Термины **high-load, кэширования, KEDA и async** для AI Service RetailPartnerX.  
Latency-budget / Redis кандидатов — [hw-2/Glossary.md](../hw-2/Glossary.md).  
GPU sizing — [hw-7/Glossary.md](../hw-7/Glossary.md).  
K8s / GitOps — [hw-8/Glossary.md](../hw-8/Glossary.md).

Документ: [high-load-architecture.md](docs/high-load-architecture.md).

---

## Нагрузка и задержки

### RPS (Requests Per Second)

Число запросов в секунду ко входу сервиса. В hw-9 целевой порядок — **10 000 RPS** (суммарно по каналам; не равно LLM RPS).

### p95 latency

95-й перцентиль времени ответа: 95% запросов быстрее порога. Для sync-path RetailPartnerX в hw-9: **&lt; 200 ms**.

### Sync hot path

Синхронный путь карточки товара (`/get_recommendation`), обязанный укладываться в latency SLO.

### Async heavy path

Очередная обработка тяжёлых запросов (shopping assistant, длинный RAG/LLM); клиент получает `job_id`, не ждёт completion в одном HTTP &lt;200 ms.

---

## Кэширование

### Multi-tier cache

Несколько уровней кэша подряд: CDN → API Gateway → Redis (candidates) → Semantic Cache → LLM.

### Semantic Cache

Кэш LLM-ответов по **векторному сходству** запроса (и context window), а не по точному строковому ключу. См. [Microsoft Learn](https://learn.microsoft.com/ru-ru/azure/cosmos-db/gen-ai/semantic-cache).

### Similarity score (θ)

Оценка близости векторов [0..1]. Порог θ в WHERE векторного запроса: hit только если score ≥ θ.

### Context window (для кэша)

Скользящая история реплик пользователя/ассистента, которую эмбеддят вместе с последним запросом, чтобы кэш был контекстно корректным.

### Cache hit / miss

Hit — ответ из кэша без (или с минимальным) LLM; miss — полный pipeline + запись в кэш.

---

## Масштабирование

### Horizontal scaling

Добавление реплик подов (AI API / Inference), а не вертикальное увеличение одной машины.

### HPA (Horizontal Pod Autoscaler)

Стандартный autoscaler Kubernetes по CPU/памяти/custom metrics — для sync API-слоя.

### KEDA

Kubernetes Event-driven Autoscaler: масштабирует Deployment/Job по внешним событиям (длина очереди, lag и т.д.). Сайт: [keda.sh](https://keda.sh/).

### ScaledObject

CRD KEDA: связывает Deployment с trigger’ом (Redis/Kafka/Service Bus…) и политикой min/max replicas.

### Inference worker

Под, выполняющий LLM/vLLM или тяжёлый agent pipeline; масштабируется KEDA по очереди.

### Warm pool

Минимум реплик GPU/inference (`minReplicaCount` &gt; 0), чтобы избежать cold start на пике.

---

## Event-Driven / Async

### EDA (Event-Driven Architecture)

Архитектура, где компоненты реагируют на события/сообщения в очереди, а не только на синхронный RPC.

### Request Queue

Очередь заданий (Redis Streams / Kafka / Service Bus) между API и Inference workers.

### Competing Consumers

Несколько worker-подов конкурируют за сообщения очереди; масштаб ≈ пропускная способность.

### Backpressure

Защита при переполнении: 503 / retry-after / отказ принимать heavy jobs, чтобы не уронить sync path.

### DLQ (Dead Letter Queue)

Очередь «ядовитых» сообщений после исчерпания retry — для разбора без блокировки основной.

---

## Global / Edge

### Geo-DNS

DNS-маршрутизация пользователя в ближайший/оптимальный регион по гео или latency.

### Edge computing

Лёгкая логика и кэш у края сети (CDN PoP): lookup, статика, сегментный ответ — без полного LLM на edge.

### Origin

Центральный (или региональный) backend / AI API, куда идёт cache miss с edge.

---

## Сокращения и подписи со схемы

Термины с [high-load-architecture.drawio](diagrams/high-load-architecture.drawio) / PNG, которых не хватало выше.  
RAG / Ranker / recsys / SKU подробнее — [hw-2/Glossary.md](../hw-2/Glossary.md); PII / Guardrails — [hw-6/Glossary.md](../hw-6/Glossary.md); vLLM — [hw-7/Glossary.md](../hw-7/Glossary.md).

### NFR (Non-Functional Requirements)

Нефункциональные требования: RPS, latency, доступность и т.п. На схеме — блок с 10k RPS и p95 &lt; 200 ms.

### CDN (Content Delivery Network)

Сеть точек присутствия (PoP) у края: отдаёт статику и короткий кэш «горячих» ответов ближе к пользователю.

### SKU (Stock Keeping Unit)

Единица товарного учёта (артикул). *Hot SKU cache* — кэш популярных карточек / рекомендаций по SKU.

### API Gateway

Входной шлюз: auth/rate limit, опциональный response cache, маршрутизация в sync recsys или async assistant.

### rate limit

Ограничение числа запросов с клиента/ключа, чтобы пик не положил AI Service.

### ingress

Входящий трафик на край системы (CDN / Gateway), до внутренних подов.

### recsys (Recommender System)

Рекомендательная система. На схеме ребро **recsys sync** = синхронный путь `/get_recommendation`.

### Ranker + Top-K

ML/правила сужают кандидатов до Top-K перед (дорогим) LLM/ответом. См. latency-budget A-001 в hw-2.

### candidates / features

Предвычисленные кандидаты и признаки в Redis для Ranker (не Semantic Cache).

### Soft degrade / fallback

Упрощённый ответ при сбое/timeout LLM: только Ranker, без полного LLM-пути — чтобы удержать SLO.

### Jobs API · job_id · HTTP 202

Async-вход assistant: сразу **202 Accepted** + идентификатор задания; результат позже через poll/push.

### SB (Service Bus)

Брокер сообщений (напр. Azure Service Bus) как вариант Request Queue рядом с Redis Streams / Kafka.

### queue length / depth metric

Глубина очереди (сколько сообщений ждёт обработки) — метрика-триггер для KEDA.

### consume

Worker забирает (потребляет) сообщение из очереди.

### enqueue

Jobs API кладёт задание в очередь.

### lookup

Поиск в Semantic Cache по вектору запроса (+ context window): проверка hit до RAG/LLM.

### store

Запись completion в Semantic Cache после успешного LLM (обычно после guardrails).

### miss (на рёбрах схемы)

1) CDN → Gateway: нет в edge-кэше.  
2) Semantic Cache → RAG: нет подходящего векторного hit (см. Cache hit / miss).

### prompt

Собранный контекст (RAG + история) уходит в LLM Client.

### complete

Worker закончил job и пишет итог в Result Store.

### Result Store

Хранилище статусов/ответов async-заданий (Redis/SQL и т.п.) для poll или push клиенту.

### webhook / SSE

**Webhook** — HTTP-колбэк клиенту по готовности. **SSE** (Server-Sent Events) — поток событий с сервера. Альтернатива опросу (**poll**).

### poll / push

Клиент сам спрашивает статус (**poll**) или сервер доставляет результат (**push**: webhook/SSE).

### RAG (Retrieval-Augmented Generation)

Retrieval по Product/Policy KB + генерация LLM. На схеме — после Semantic Cache miss.

### KB (Knowledge Base)

База знаний: Product KB + Policy KB (hw-3/5).

### LLM / LLM Client / SaaS / self-host

Большая языковая модель; доступ через абстракцию LLM Client (hw-4) — облачный SaaS или свой инстанс.

### vLLM

Движок инференса LLM с batching/paging KV — в Inference Workers (hw-7).

### PII (Personally Identifiable Information)

Персональные данные. На схеме: Security Layer маскирует/фильтрует до записи в кэш.

### Guardrails

Входные/выходные ограничения (injection, токсичность, policy) до ответа пользователю и до cache write.

### guarded write

Запись в Semantic Cache только после прохождения Security Layer (PII + Output Guardrails).

### Observability · hit-rate · metrics

Мониторинг: доля cache hit, глубина очереди, p95 и др. (hw-6); ребро **metrics** — телеметрия с workers.

### HTTPS

Шифрованный HTTP от клиента до CDN/Gateway.

---

## Быстрый указатель

| Термин | Одной фразой |
| ------ | ------------ |
| 10k RPS / &lt;200 ms | Целевые NFR sync-path |
| CDN / Edge / Geo-DNS / SKU | Край сети и hot SKU cache |
| recsys sync | Sync `/get_recommendation` |
| Ranker + Top-K / candidates | Узкий sync-path без полного LLM |
| Soft degrade / fallback | Ranker-only при timeout |
| lookup / store / miss | Поиск, запись и промах Semantic Cache |
| enqueue / consume / complete | Положить в очередь → взять → готово |
| Jobs API · 202 · job_id | Async accept без ожидания LLM |
| SB / Kafka / Redis Streams | Варианты Request Queue |
| queue length / depth metric | Триггер KEDA |
| Result Store · poll / push · SSE | Как клиент забирает async-ответ |
| RAG / KB / prompt | Miss → retrieval → LLM |
| vLLM / warm GPU | Inference workers |
| PII / Guardrails / guarded write | Безопасная запись в кэш |
| KEDA / ScaledObject / HPA | Scale по очереди / по CPU·RPS |
| Backpressure | Не убить sync при пике LLM |
