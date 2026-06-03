# C3 — AI Service (RAG + LLM, future)

> **Уровень:** C3 Component · **Статус:** Prod / genAI, **не** в Sequence MVP

Компоненты из ДЗ: Controller, RAG Manager, LLM Client, Prompt Template Factory.

## Связанные диаграммы

| MVP (recsys) | [c3-ai-service-recsys.md](c3-ai-service-recsys.md) |
| Контейнеры | [c2-containers.md](c2-containers.md) |

```mermaid
C4Component
    title C3. AI Service — RAG future Prod

    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")

    Container_Boundary(ai, "AI Service") {
        Component(ctrl, "Controller", "REST")
        Component(llm, "LLM Client", "модель")
        Component(rag, "RAG Manager", "retrieval")
        Component(prompts, "Prompt Factory", "шаблоны")
    }

    ContainerDb(vec, "Vector DB", "embeddings")
    ContainerDb(sql, "SQL DB", "логи")

    Rel_D(ctrl, rag, "", "")
    Rel(rag, prompts, "", "")
    Rel_U(prompts, llm, "prompt", "")
    Rel_Back(llm, ctrl, "ответ", "")
    Rel_D(rag, vec, "search", "")
    Rel_D(ctrl, sql, "log", "")

    UpdateRelStyle(ctrl, rag, $offsetX="-10")
    UpdateRelStyle(prompts, llm, $offsetX="10")
    UpdateRelStyle(llm, ctrl, $offsetY="-50", $offsetX="15")
    UpdateRelStyle(rag, vec, $offsetX="-40", $offsetY="5")
    UpdateRelStyle(ctrl, sql, $offsetX="-40", $offsetY="5")
```
