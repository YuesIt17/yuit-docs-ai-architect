# Глоссарий hw-3

Термины мультиагентных систем и RAG для RetailPartnerX. Общие определения C4, RAG, Vector DB — в [hw-2/Glossary.md](../hw-2/Glossary.md).

| Термин | Расшифровка | Кратко |
|--------|-------------|--------|
| **Orchestrator** | Координатор агентов | Менеджер: планирует шаги, делегирует специалистам, собирает ответ |
| **SRP** | Single Responsibility Principle | Один агент — одна зона ответственности |
| **Policy KB** | Policy Knowledge Base | База политик: аллергены, акции, GDPR, blocklists (R4) |
| **Product KB** | Product Knowledge Base | Эмбеддинги описаний SKU из PIM (Vector DB hw-2) |
| **Hybrid retrieval** | Гибридный поиск | Dense (vector) + sparse (BM25) для юридических формулировок |
| **Reranking** | Переранжирование | Cross-encoder сужает Top-N чанков до Top-K для LLM |
| **LangGraph** | — | Фреймворк state machine для multi-agent workflow |
| **Guardrails** | Ограничители | Policy Analyst блокирует нарушения до ответа пользователю (R8) |
