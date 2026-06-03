# Draw.io — RetailPartnerX (зеркало Mermaid)

Редактор: [app.diagrams.net](https://app.diagrams.net/)

Файлы `.drawio` в этой папке сгенерированы скриптом `generate_drawio.mjs` (зеркало [../mermaid/](../mermaid/)). Откройте в [diagrams.net](https://app.diagrams.net/), при необходимости подтяните C4-стили и расположение, затем сохраните в GitHub.

**Пересоздать все схемы** (Node.js 18+):

```bash
node generate_drawio.mjs
```

## Файлы

| Файл | Уровень | Mermaid-источник |
|------|---------|------------------|
| `c1-context.drawio` | C1 Context | [c1-context.md](../mermaid/c1-context.md) |
| `c2-containers.drawio` | C2 Container | [c2-containers.md](../mermaid/c2-containers.md) |
| `c3-ai-service-recsys.drawio` | C3 Component | [c3-ai-service-recsys.md](../mermaid/c3-ai-service-recsys.md) |
| `c3-ai-service-rag-future.drawio` | C3 Component | [c3-ai-service-rag-future.md](../mermaid/c3-ai-service-rag-future.md) |
| `sequence-get-recommendation.drawio` | UML Sequence | [sequence-get-recommendation.md](../mermaid/sequence-get-recommendation.md) |

## Как рисовать

1. **More shapes** → включить библиотеку **C4** (для C1–C3).
2. **C2:** boundary `RetailPartnerX E-commerce`; контейнеры Frontend, Backend, AI Service, SQL DB, Vector DB; внешний PIM.
3. **C3 recsys:** только внутри AI Service — Controller, Scenario Router, Candidate Loader, Ranker, Response Builder; снаружи SQL DB, Redis Cache.
4. **C3 RAG future:** Controller, RAG Manager, LLM Client, Prompt Template Factory; Vector DB обязательна.
5. **Sequence:** генерируется с вертикальными lifelines и горизонтальными сообщениями (как в Mermaid). При правках в diagrams.net не сводите участников в один ряд — иначе подписи наложатся.

## Подписи на стрелках (C2)

| От | К | Подпись |
|----|---|---------|
| Покупатель | Frontend | HTTPS |
| Frontend | Backend | REST |
| Backend | AI Service | POST get_recommendation |
| Backend | SQL DB | SQL |
| AI Service | SQL DB | SQL |
| AI Service | Vector DB | опционально / RAG future |
| Backend | PIM | REST |

## Экспорт

File → Export as → PNG или PDF (для вложения в отчёт).

## Чеклист перед commit

- [ ] 5 файлов `.drawio` в этой папке
- [ ] C2 без внутренних компонентов AI Service
- [ ] Имена совпадают с Mermaid
- [ ] Sequence отражает recsys (не RAG)
