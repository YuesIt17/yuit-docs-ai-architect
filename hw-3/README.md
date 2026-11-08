# Assignment hw-3 — RetailPartnerX

**Designing the intelligent core: RAG and a multi-agent system**

> **Abbreviations:** [Glossary](Glossary.md) · **Artifacts:** [diagrams/](diagrams/) · **Code:** [code/](code/)

## Goal

Design a multi-agent system with a RAG pipeline to automate a **personal shopping assistant** in the RetailPartnerX mobile app chat.

## Context and Continuity

| Assignment                                    | Artifact                  | Link to hw-3                                       |
| --------------------------------------------- | ------------------------- | -------------------------------------------------- |
| [hw-1](../hw-1/RetailPartnerX_AI_Strategy.md) | AI recommendation strategy | "App" channel, risks R4/R6/R8, GDPR               |
| [hw-2](../hw-2/diagrams/README.md)            | C4, Sequence, OpenAPI     | Vector DB, RAG Manager, `POST /get_recommendation` |

**Task:** the "Smart Shopping Assistant" subsystem — a B2C scenario in the app chat.

**Example request:** _"Build a dinner for 4 people: pasta, gluten-free, budget up to 2000 ₽, taking promotions into account"_.

The topic replaces the course template "business travel booking" while keeping the assignment structure (agents, RAG, Colab).

## Steps (Solution Artifacts)

| Assignment step    | Document / file                                                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1. Pattern choice  | [docs/agents.md](docs/agents.md)                                                                                                    |
| 2. Architecture    | [diagrams/multi-agent-architecture.drawio](diagrams/multi-agent-architecture.drawio) · [PNG](diagrams/multi-agent-architecture.png) |
| 3. RAG Flow        | [docs/rag-pipeline.md](docs/rag-pipeline.md)                                                                                        |
| 4. Prototype       | [code/](code/) — module, tests, notebook                                                                                            |

Additionally: [diagrams/sequence-shopping-assistant.drawio](diagrams/sequence-shopping-assistant.drawio) — the scenario's happy path.

## Submission Format

| Artifact                | Path                                                                           |
| ----------------------- | ------------------------------------------------------------------------------ |
| Architecture diagram (PNG) | [diagrams/multi-agent-architecture.png](diagrams/multi-agent-architecture.png) |
| LangGraph prototype     | [code/](code/)                                                                 |
| **Code check**          | `pytest hw-3/code/tests` — see [code/README.md](code/README.md)                |

```bash
pip install -r tools/python/requirements.txt
python -m pytest hw-3/code/tests -q
```

Environment: a single venv at the repo root — [tools/python/README.md](../tools/python/README.md).

**Colab (optional):**

1. Push the branch to GitHub (the repository must be **public**, otherwise Colab cannot `git clone` it).
2. Open the notebook in Colab (button or link):

   [Open in Colab](https://colab.research.google.com/github/YuesIt17/yuit-docs-ai-architect/blob/hw-3-multi-agent-rag/hw-3/code/notebooks/shopping_assistant_demo.ipynb)

3. **Runtime → Run all** — the first cell clones the repo and installs the dependencies from `tools/python/requirements.txt`.
4. **File → Save a copy in Drive**.
5. **Share → General access → Anyone with the link** → copy the URL of the form `https://colab.research.google.com/drive/...`.
6. Paste the link below (the submission requires a **Drive copy**, not a GitHub URL).

**Colab link:** _(https://colab.research.google.com/drive/1HSTFLZGHuBEGktYXtoYuZPBZF5-YMUXt?usp=sharing)_

## Diagrams (drawio-mcp)

```bash
node tools/drawio-mcp/src/cli.mjs --hw hw-3
node tools/drawio-mcp/src/cli.mjs --export-png hw-3/diagrams/multi-agent-architecture.drawio
```

MCP: `generate_hw_diagrams`, `export_drawio_png`.

## Self-Check Criteria

| Criterion              | How it is met                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| Decomposition logic    | 6 agents with SRP in [docs/agents.md](docs/agents.md); the Orchestrator does not search the catalog itself |
| RAG                    | Policy KB + Product KB, Vector DB, hybrid search, reranking — [docs/rag-pipeline.md](docs/rag-pipeline.md) |
| Working code           | LangGraph 6-agent stub + `pytest hw-3/code/tests`                                                          |

## Useful Materials

| Tool                                                                                     | Description              |
| ---------------------------------------------------------------------------------------- | ------------------------ |
| [LangChain Agents](https://reference.langchain.com/python/langchain/agents)              | Quick start with agents  |
| [RAG Pipeline (Pinecone)](https://www.pinecone.io/learn/retrieval-augmented-generation/) | Building a RAG pipeline  |
