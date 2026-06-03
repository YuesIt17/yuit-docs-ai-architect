# C2 — Container (RetailPartnerX)

> **Уровень:** C2 Container · **Обязательно в ДЗ**

Deployable-контейнеры MVP: Frontend, Backend, AI Service, SQL DB, Vector DB.

## Связанные диаграммы

| Детализация | Файл |
|-------------|------|
| Компоненты AI Service (MVP) | [c3-ai-service-recsys.md](c3-ai-service-recsys.md) |
| RAG (future) | [c3-ai-service-rag-future.md](c3-ai-service-rag-future.md) |
| Контекст | [c1-context.md](c1-context.md) |

```mermaid
C4Container
    title C2. Контейнеры — RetailPartnerX MVP

    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")

    Person(shopper, "Покупатель", "Сайт / приложение")
    System_Ext(pim, "PIM", "Каталог")

    Container_Boundary(rpx, "RetailPartnerX E-commerce") {
        Container(fe, "Frontend", "Web / App", "UI")
        Container(be, "Backend", "BFF", "Корзина")
        Container(ai, "AI Service", "Go / Python", "Recsys")
        ContainerDb(sql, "SQL DB", "PostgreSQL")
        ContainerDb(vec, "Vector DB", "опционально")
    }

    Rel(shopper, fe, "HTTPS", "")
    Rel(fe, be, "REST", "")
    Rel(be, ai, "get_recommendation", "REST")
    Rel(be, sql, "SQL", "")
    Rel(ai, sql, "SQL", "")
    Rel(ai, vec, "search", "")
    Rel(be, pim, "каталог", "REST")

    UpdateRelStyle(be, sql, $offsetX="-12")
    UpdateRelStyle(ai, sql, $offsetX="12")
    UpdateRelStyle(ai, vec, $offsetY="12")
    UpdateRelStyle(be, pim, $offsetY="-20")
```
