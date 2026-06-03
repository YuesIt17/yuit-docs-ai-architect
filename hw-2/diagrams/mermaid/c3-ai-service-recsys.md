# C3 — AI Service (recsys, MVP)

> **Уровень:** C3 Component · **Обязательно в ДЗ** · **Связность:** Sequence + OpenAPI

Внутренняя структура контейнера **AI Service** для PoC/MVP (без RAG).

## Связанные артефакты

| Артефакт | Файл |
|----------|------|
| Sequence | [sequence-get-recommendation.md](sequence-get-recommendation.md) |
| OpenAPI | [recommendation-api.yaml](../../openapi/recommendation-api.yaml) |
| Контейнеры | [c2-containers.md](c2-containers.md) |

```mermaid
C4Component
    title C3. AI Service — recsys MVP

    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")

    Container_Boundary(ai, "AI Service") {
        Component(ctrl, "Controller", "REST API")
        Component(router, "Router", "сценарии")
        Component(loader, "Loader", "кандидаты")
        Component(ranker, "Ranker", "ML / rules")
        Component(builder, "Builder", "ответ JSON")
    }

    ContainerDb(cache, "Redis", "кэш")
    ContainerDb(sql, "SQL DB", "история")

    Rel(ctrl, router, "", "")
    Rel_D(router, loader, "", "")
    Rel(loader, ranker, "", "")
    Rel_D(ranker, builder, "", "")
    Rel_D(loader, cache, "read", "")
    Rel_R(loader, sql, "read", "")
    Rel_Back(builder, ctrl, "response", "")

    UpdateRelStyle(router, loader, $offsetX="-8")
    UpdateRelStyle(ranker, builder, $offsetX="8")
    UpdateRelStyle(loader, cache, $offsetX="-35", $offsetY="8")
    UpdateRelStyle(loader, sql, $offsetX="35", $offsetY="8")
    UpdateRelStyle(builder, ctrl, $offsetY="-55", $offsetX="-25")
```
