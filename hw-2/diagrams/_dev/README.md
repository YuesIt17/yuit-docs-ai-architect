# _dev — вспомогательные материалы hw-2

**Не для сдачи.** Здесь layout-specs, генератор и шаблоны.

| Путь | Назначение |
|------|------------|
| [specs/](specs/) | JSON-снимки layout для Draw.io MCP |
| [templates/](templates/) | Учебный пример RAG из текста ДЗ |
| [generate_drawio.mjs](generate_drawio.mjs) | Обёртка CLI (`--hw hw-2`; frozen не перезаписывает `.drawio`) |

Перегенерация одного файла (из корня репозитория):

```bash
node tools/drawio-mcp/src/cli.mjs \
  --spec hw-2/diagrams/_dev/specs/c1-context.json \
  --output hw-2/diagrams/drawio/c1-context.drawio
```

Конвенции: [tools/drawio-mcp/CONVENTIONS.md](../../../tools/drawio-mcp/CONVENTIONS.md).
