# Sequence — запрос рекомендации

> **Сценарий:** карточка товара (happy path) · **Обязательно в ДЗ**

Участники в **box**-группах совпадают с [c3-ai-service-recsys.md](c3-ai-service-recsys.md). API: [recommendation-api.yaml](../../openapi/recommendation-api.yaml).

## Связанные артефакты

| Артефакт | Файл |
|----------|------|
| C3 recsys | [c3-ai-service-recsys.md](c3-ai-service-recsys.md) |
| OpenAPI | [recommendation-api.yaml](../../openapi/recommendation-api.yaml) |
| Draw.io | [sequence-get-recommendation.drawio](../drawio/sequence-get-recommendation.drawio) |

```mermaid
sequenceDiagram
    autonumber

    box Канал
        participant Shopper as Покупатель
        participant FE as Frontend
        participant BE as Backend
    end

    box AI Service
        participant Ctrl as Controller
        participant Router as Router
        participant Loader as Loader
        participant Ranker as Ranker
        participant Builder as Builder
    end

    box Данные
        participant Redis as Redis
        participant SQL as SQL DB
    end

    Shopper->>FE: Карточка SKU-123
    FE->>BE: GET /products/SKU-123
    BE->>Ctrl: POST /get_recommendation
    Note over BE,Ctrl: user_id, context=product_page

    Ctrl->>Router: resolve
    Router->>Loader: loadCandidates
    Loader->>Redis: GET cache

    alt hit
        Redis-->>Loader: candidates
    else miss
        Loader->>SQL: SELECT
        SQL-->>Loader: rows
    end

    Loader->>Ranker: rank
    Ranker->>Builder: scored
    Builder-->>Ctrl: recommendations
    Ctrl-->>BE: 200 OK
    BE-->>FE: product + recs
    FE-->>Shopper: С этим покупают
```
