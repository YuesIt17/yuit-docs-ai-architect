# Draw.io MCP — конвенции

Соглашения для генератора `tools/drawio-mcp` и JSON-спеков в домашних заданиях.

## Роли артефактов

| Артефакт | Где | Source of truth |
|----------|-----|-----------------|
| **Tool** (MCP, CLI, builder) | `tools/drawio-mcp/` | Код генератора |
| **JSON spec** | `{hwId}/diagrams/_dev/specs/*.json` | Снимок/layout для перегенерации и MCP |
| **`.drawio`** | `{hwId}/diagrams/drawio/*.drawio` | **Финальная сдача**; после ручной правки — главный артеfact |
| **`manifest.json`** | `{hwId}/diagrams/_dev/specs/` | Список `frozen` + опциональная автогенерация |

### hw-2: все диаграммы зафиксированы

После ручного форматирования в diagrams.net **не перегенерировать** `.drawio` через CLI/MCP — только править файл в редакторе. Спеки синхронизированы со схемами как **документация layout**, не как обязательный пайплайн сборки.

## Структура spec (C4)

```json
{
  "title": "C2 Containers",
  "pageWidth": 1240,
  "pageHeight": 620,
  "nodes": [
    {
      "id": "fe",
      "label": "Frontend\nWeb, iOS, Android",
      "style": "container",
      "x": 40,
      "y": 88,
      "w": 160,
      "h": 79,
      "parent": "boundary"
    }
  ],
  "edges": [
    {
      "from": "fe",
      "to": "be",
      "label": "REST",
      "parent": "boundary",
      "exitX": 1,
      "exitY": 0.5,
      "entryX": 0,
      "entryY": 0.5,
      "waypoints": [{ "x": 335, "y": 167 }],
      "labelOffset": { "x": 0, "y": -12 }
    }
  ]
}
```

### Стили узлов (`style`)

| Значение | C4 / Draw.io | Цвет |
|----------|--------------|------|
| `person` | UML Actor | синий |
| `system` | Система (C1) | синий блок |
| `container` | Контейнер (C2) | синий блок |
| `component` | Компонент (C3) | голубой блок |
| `external` | Внешняя система | серый |
| `db` | Цилиндр БД | синий |
| `boundary` | Пунктирная рамка | без заливки |
| `note` | Заметка (Sequence) | жёлтый |

### Координаты

- **`x`, `y`, `w`, `h`** — в пикселях, сетка Draw.io 10 px.
- **Без `parent`** — координаты **абсолютные** (от листа).
- **С `parent: "boundary"`** — координаты **относительно** родительской рамки (как в Draw.io).
- После ручного редактирования округляйте до целых; дроби из Draw.io (напр. `79.2`) в spec → `79`.

### Подписи

- Перенос строки в JSON: `\n` → в XML станет `&#10;`.
- **Не используйте** `<br>` в spec — ломает XML.

## Маршрутизация рёбер

| Поле | Диапазон | Назначение |
|------|----------|------------|
| `exitX`, `exitY` | 0–1 | Точка выхода на грани source |
| `entryX`, `entryY` | 0–1 | Точка входа на грани target |
| `waypoints` | `[{x,y}, …]` | «Колeno» orthogonal-стрелки |
| `labelOffset` | `{x,y}` | Сдвиг подписи от линии |
| `parent` | id boundary | Ребро рисуется внутри рамки (C2/C3) |

### Правила вёрстки (RetailPartnerX)

1. **Горизонтальные связи** — подпись **над** линией: `labelOffset: { "y": -12 }`.
2. **Вертикальные связи** (к БД) — подпись **сбоку**: `labelOffset: { "x": ±10–12, "y": 0 }`.
3. **Длинные подписи** — увеличивайте зазор между блоками (`x`), не укорачивайте смысл без необходимости.
4. **Возвратные стрелки** (Ответ, JSON response) — маршрут **сверху** или **слева** через `waypoints`, не через центр блоков.
5. **Внешние системы** (PIM) — достаточный отступ от boundary; при необходимости `waypoints`.
6. **`labelBackgroundColor`** — белый фон подписей включён в стиль edge генератора.

### Ограничения генератора

- Не все edge-конструкции Draw.io (floating `targetPoint`, `mxGeometry x=` как доля) экспортируются 1:1 — сложные правки остаются в `.drawio`.
- Sequence: только равномерная сетка участников; тонкая подгонка — в редакторе.

## Sequence spec

```json
{
  "title": "Sequence get recommendation",
  "pageWidth": 1430,
  "pageHeight": 1026,
  "sequence": {
    "colWidth": 130,
    "boxWidth": 108,
    "startX": 50,
    "headerY": 30,
    "msgY0": 130,
    "msgStep": 48,
    "participants": [ … ],
    "messages": [ … ],
    "notes": [{ "afterMessage": 2, "label": "…", "w": 200, "h": 50 }]
  }
}
```

- `from` / `to` — индекс участника (0-based) или `id`.
- `"return": true` — пунктирная обратная стрелка.

## Manifest

```json
{
  "hwId": "hw-2",
  "frozen": ["c1-context.drawio", "…"],
  "diagrams": []
}
```

| Поле | Смысл |
|------|--------|
| `frozen` | Файлы **не перезаписывать** при `generate_hw_diagrams` |
| `diagrams` | Пары `{ spec, output }` для автогенерации (пусто = только ручные `.drawio`) |

## Workflow

### Новая диаграмма (hw-3+)

1. Написать JSON spec (или inline через MCP `generate_drawio`).
2. Сгенерировать черновик `.drawio`.
3. Довести в diagrams.net.
4. **Синхронизировать spec** с финальными координатами (опционально, для наследования).
5. Добавить в `frozen` после приёмки.

### Правка зафиксированной схемы (hw-2)

1. Редактировать **только** `.drawio`.
2. При желании обновить spec «для истории» — перенести координаты из Draw.io в JSON **без** перегенерации.

## CLI / MCP

```bash
# Один файл (не перезаписывать frozen без явного output)
node src/cli.mjs --spec hw-2/diagrams/_dev/specs/c1-context.json \
  --output /tmp/preview.drawio

# Пакет по manifest (hw-2: diagrams пуст — ничего не делает)
node src/cli.mjs --hw hw-2
```

MCP tools: `generate_drawio`, `generate_hw_diagrams`, `list_hw_diagram_bundles`, `get_drawio_spec_schema`.

## Именование файлов

| Уровень | Spec | Draw.io |
|---------|------|---------|
| C1 | `c1-context.json` | `c1-context.drawio` |
| C2 | `c2-containers.json` | `c2-containers.drawio` |
| C3 recsys | `c3-ai-service-recsys.json` | `c3-ai-service-recsys.drawio` |
| C3 RAG (шаблон) | `_dev/templates/c3-ai-service-rag-future.json` | не сдаётся |
| Sequence | `sequence-get-recommendation.json` | `sequence-get-recommendation.drawio` |

## Связь с C4 hw-2

- **C3 recsys** + **Sequence** + **OpenAPI** — одна цепочка MVP (имена компонентов совпадают).

См. [hw-2/diagrams/README.md](../../hw-2/diagrams/README.md).
