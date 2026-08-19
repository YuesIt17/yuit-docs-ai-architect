# Домашнее задание hw-3 — RetailPartnerX

**Проектирование интеллектуального ядра: RAG и мультиагентная система**

> **Сокращения:** [Глоссарий](Glossary.md) · **Артефакты:** [diagrams/](diagrams/) · **Код:** [code/](code/)

## Цель

Спроектировать мультиагентную систему с RAG-пайплайном для автоматизации **персонального шопинг-ассистента** в чате мобильного приложения RetailPartnerX.

## Контекст и преемственность

| ДЗ                                            | Артефакт                  | Связь с hw-3                                       |
| --------------------------------------------- | ------------------------- | -------------------------------------------------- |
| [hw-1](../hw-1/RetailPartnerX_AI_Strategy.md) | AI-стратегия рекомендаций | Канал «приложение», риски R4/R6/R8, GDPR           |
| [hw-2](../hw-2/diagrams/README.md)            | C4, Sequence, OpenAPI     | Vector DB, RAG Manager, `POST /get_recommendation` |

**Задача:** подсистема «Умный помощник покупателя» — B2C-сценарий в чате приложения.

**Пример запроса:** _«Собери ужин на 4 человека: паста, без глютена, бюджет до 2000 ₽, с учётом акций»_.

Тема заменяет учебный шаблон «оформление командировок», сохраняя структуру ДЗ (агенты, RAG, Colab).

## Шаги выполнения (артефакты решения)

| Шаг ДЗ             | Документ / файл                                                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1. Выбор паттернов | [docs/agents.md](docs/agents.md)                                                                                                    |
| 2. Архитектура     | [diagrams/multi-agent-architecture.drawio](diagrams/multi-agent-architecture.drawio) · [PNG](diagrams/multi-agent-architecture.png) |
| 3. RAG Flow        | [docs/rag-pipeline.md](docs/rag-pipeline.md)                                                                                        |
| 4. Прототип        | [code/](code/) — модуль, тесты, notebook                                                                                            |

Дополнительно: [diagrams/sequence-shopping-assistant.drawio](diagrams/sequence-shopping-assistant.drawio) — happy path сценария.

## Формат сдачи

| Артефакт                | Путь                                                                           |
| ----------------------- | ------------------------------------------------------------------------------ |
| Схема архитектуры (PNG) | [diagrams/multi-agent-architecture.png](diagrams/multi-agent-architecture.png) |
| Прототип LangGraph      | [code/](code/)                                                                 |
| **Проверка кода**       | `pytest hw-3/code/tests` — см. [code/README.md](code/README.md)                |

```bash
pip install -r tools/python/requirements.txt
python -m pytest hw-3/code/tests -q
```

Окружение: один venv в корне репо — [tools/python/README.md](../tools/python/README.md).

**Colab (опционально):**

1. Запушьте ветку на GitHub (репозиторий должен быть **публичным** или Colab не сможет `git clone`).
2. Откройте ноутбук в Colab (кнопка или ссылка):

   [Open in Colab](https://colab.research.google.com/github/YuesIt17/yuit-docs-ai-architect/blob/hw-3-multi-agent-rag/hw-3/code/notebooks/shopping_assistant_demo.ipynb)

3. **Runtime → Run all** — первая ячейка клонирует репо и ставит зависимости из `tools/python/requirements.txt`.
4. **File → Save a copy in Drive**.
5. **Share → General access → Anyone with the link** → скопируйте URL вида `https://colab.research.google.com/drive/...`.
6. Вставьте ссылку ниже (для сдачи нужна именно **Drive-копия**, не GitHub-URL).

**Ссылка на Colab:** _(https://colab.research.google.com/drive/1HSTFLZGHuBEGktYXtoYuZPBZF5-YMUXt?usp=sharing)_

## Диаграммы (drawio-mcp)

```bash
node tools/drawio-mcp/src/cli.mjs --hw hw-3
node tools/drawio-mcp/src/cli.mjs --export-png hw-3/diagrams/multi-agent-architecture.drawio
```

MCP: `generate_hw_diagrams`, `export_drawio_png`.

## Критерии самопроверки

| Критерий               | Как закрыто                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| Логика декомпозиции    | 6 агентов с SRP в [docs/agents.md](docs/agents.md); Orchestrator не ищет в каталоге сам                    |
| RAG                    | Policy KB + Product KB, Vector DB, hybrid search, reranking — [docs/rag-pipeline.md](docs/rag-pipeline.md) |
| Работоспособность кода | LangGraph 6-agent stub + `pytest hw-3/code/tests`                                                          |

## Полезные материалы

| Инструмент                                                                               | Описание                 |
| ---------------------------------------------------------------------------------------- | ------------------------ |
| [LangChain Agents](https://reference.langchain.com/python/langchain/agents)              | Быстрый старт с агентами |
| [RAG Pipeline (Pinecone)](https://www.pinecone.io/learn/retrieval-augmented-generation/) | Построение RAG-пайплайна |
