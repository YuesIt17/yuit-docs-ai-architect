# hw-3 Glossary

Terms for multi-agent systems and RAG for RetailPartnerX. General definitions of C4, RAG, Vector DB are in [hw-2/Glossary.md](../hw-2/Glossary.md).

| Term | Expansion | In short |
|--------|-------------|--------|
| **Orchestrator** | Agent coordinator | Manager: plans steps, delegates to specialists, assembles the answer |
| **SRP** | Single Responsibility Principle | One agent — one area of responsibility |
| **Policy KB** | Policy Knowledge Base | Policy base: allergens, promotions, GDPR, blocklists (R4) |
| **Product KB** | Product Knowledge Base | Embeddings of SKU descriptions from PIM (hw-2 Vector DB) |
| **Hybrid retrieval** | Hybrid search | Dense (vector) + sparse (BM25) for legal wording |
| **Reranking** | Re-ranking | A cross-encoder narrows Top-N chunks to Top-K for the LLM |
| **LangGraph** | — | A state machine framework for multi-agent workflows |
| **Guardrails** | Guardrails | The Policy Analyst blocks violations before the reply reaches the user (R8) |
