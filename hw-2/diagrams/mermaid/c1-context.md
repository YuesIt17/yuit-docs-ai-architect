# C1 — Context (RetailPartnerX)

> **Уровень:** C1 Context · **Статус:** опционально (компетенция), полезно перед C2

Система рекомендаций в окружении заказчика: покупатель, внешние PIM, CDP и программа лояльности.

## Связанные диаграммы

| Далее | Файл |
|-------|------|
| Контейнеры | [c2-containers.md](c2-containers.md) |

```mermaid
C4Context
    title C1. Система персональных рекомендаций RetailPartnerX

    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")

    Person(shopper, "Покупатель", "Сайт / приложение")
    System(recsys, "Система рекомендаций", "Ранжирование SKU")
    System_Ext(pim, "PIM", "Каталог, SKU")
    System_Ext(cdp, "CDP / CRM", "Профиль, события")
    System_Ext(loyalty, "Лояльность", "Customer ID")

    Rel(shopper, recsys, "Просмотр рекомендаций", "HTTPS")
    Rel_D(recsys, pim, "Каталог", "API")
    Rel_D(recsys, cdp, "События", "stream")
    Rel_D(recsys, loyalty, "ID клиента", "API")

    UpdateRelStyle(shopper, recsys, $offsetY="-35", $offsetX="-50")
    UpdateRelStyle(recsys, pim, $offsetX="-45", $offsetY="12")
    UpdateRelStyle(recsys, cdp, $offsetX="50", $offsetY="12")
    UpdateRelStyle(recsys, loyalty, $offsetX="55", $offsetY="18")
```

## Подписи на связях (полный текст для отчёта)

| От → к | На диаграмме | Расшифровка |
|--------|----------------|-------------|
| Покупатель → Система | Просмотр рекомендаций [HTTPS] | Просматривает рекомендации по HTTPS |
| Система → PIM | Каталог [API] | Загрузка каталога SKU |
| Система → CDP | События [stream] | Профиль и поведенческие события |
| Система → Лояльность | ID клиента [API] | Идентификатор в программе лояльности |
