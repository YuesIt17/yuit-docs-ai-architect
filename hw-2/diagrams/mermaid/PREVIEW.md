# Просмотр Mermaid в Cursor / VS Code

## Как открыть

1. Файл из [README.md](README.md) (например, `c1-context.md`).
2. **Markdown: Open Preview** — `Cmd+Shift+V` (macOS) / `Ctrl+Shift+V` (Windows).
3. Не запускайте **Mermaid: Preview Diagram** на всём `.md` — будет ошибка `No diagram type detected`.

## Mermaid и Draw.io — разный стиль

| | Mermaid (`.md`) | Draw.io (`.drawio`) |
|--|-----------------|---------------------|
| Стрелки | Авто: прямые/диагонали, возможны пересечения | Ортогональные (ломаные под 90°), руками |
| Блоки C4 | Фиксированный рендер Mermaid | Библиотека C4 в diagrams.net |
| Стиль 1:1 с Draw.io | **Нет** — в C4 нет ортогонального роутинга и ручных точек излома | **Да** — эталон для сдачи и отчёта |
| Зачем Mermaid | Текст в Git, Preview в IDE, связность с OpenAPI | — |

Для ДЗ: **смысл и имена** держите в Mermaid; **внешний вид как в задании** — в [drawio/](../drawio/) (экспорт PNG/PDF оттуда). Вставить картинку из Draw.io в `.md` можно так: `![C1](../drawio/export/c1-context.png)` — тогда Preview совпадёт с diagrams.net.

## Структура `.md`

Сначала заголовок и пояснения, **диаграмма в конце** — так удобнее читать в репозитории. **Markdown: Open Preview** (`Cmd+Shift+V`) рендерит все fenced-блоки `mermaid` в файле.

Если снова появится `No diagram type detected` — не используйте **Mermaid: Preview Diagram** на всём файле; откройте полный Markdown Preview или [mermaid.live](https://mermaid.live).

## Нотация в репозитории

| Тип Mermaid | Файлы |
|-------------|--------|
| `C4Context` | c1-context |
| `C4Container` | c2-containers |
| `C4Component` | c3-ai-service-recsys, c3-ai-service-rag-future |
| `sequenceDiagram` | sequence-get-recommendation |

Для [mermaid.live](https://mermaid.live) скопируйте содержимое fenced-блока без строк `` ```mermaid `` и `` ``` ``.

## Раскладка (меньше пересечений стрелок)

- **C4:** порядок объявления элементов задаёт позиции; `UpdateLayoutConfig` в начале блока; `Rel_D` / `Rel_L` / `Rel_R` / `Rel_Back` задают направление связи.
- **`UpdateRelStyle(from, to, $offsetX, $offsetY)`** — сдвигает только **текст подписи** на стрелке, не линию. Расстояние между блоками косвенно: меньше `$c4ShapeInRow` (например `2` вместо `3`) — шире ячейки сетки; короче подписи `Rel` — меньше налезаний.
- Расширить блоки «в пикселях» в Mermaid C4 **нельзя** — только сетка, порядок узлов и смещение текста.
- **Sequence:** участники сгруппированы в `box` (Канал → AI Service → Данные), поток сообщений слева направо внутри группы.

## Превью для агента (опционально)

Экспорт PNG: `npx @mermaid-js/mermaid-cli -i c1-context.md -o export/c1-context.png` — положите в `export/` или приложите скрин в чат.

## Если диаграмма не рисуется

- **Developer: Reload Window**
- Убедитесь, что включено `markdown.mermaid.enabled` (см. `.vscode/settings.json`)
- Проверьте ту же диаграмму на mermaid.live
