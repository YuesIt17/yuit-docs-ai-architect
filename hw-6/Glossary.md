# hw-6 Glossary

Terms for QA, Security and Observability for RetailPartnerX. Guardrails (in the agent sense) are in [hw-3/Glossary.md](../hw-3/Glossary.md); GDPR / R4–R8 are in [hw-1/Glossary.md](../hw-1/Glossary.md); RAG / Vector DB are in [hw-2/Glossary.md](../hw-2/Glossary.md).

| Term | Expansion | In short |
|--------|-------------|--------|
| **PII Sanitizer** | Personally Identifiable Information Sanitizer | Masking personal data in prompts and logs before sending to the LLM |
| **Prompt Injection** | Injecting instructions into a prompt | An "ignore the policy" attack / jailbreak (OWASP LLM01) |
| **Input Guard** | Input guard | A filter for injection and unsafe requests before the Orchestrator |
| **Output Guardrails** | Output guardrails | Validating the LLM response: blocklist, citations, schema |
| **Secret Manager** | Secret manager | Storing and rotating API keys outside the service code |
| **Faithfulness** | Faithfulness to the context facts | Share of answer statements supported by RAG chunks |
| **Answer Relevancy** | Answer relevance | How well the answer matches the user's question |
| **Context Precision** | Context precision | Share of useful chunks in the Top-K retrieval |
| **Context Recall** | Context completeness | Whether the needed gold facts made it into the retrieved set |
| **Ragas** | RAG Assessment | A library of offline RAG quality metrics |
| **DeepEval** | — | An LLM/RAG testing framework, convenient for CI gates |
| **Golden Signals** | Latency, Traffic, Errors, Saturation | Basic SRE service signals (Google SRE) |
| **Langfuse** | — | Tracing of LLM calls, tokens and cost |
| **Prometheus** | — | Collecting and storing metrics for Grafana |
| **Tempo** | Grafana Tempo | Distributed traces (often with OpenTelemetry) |
| **SLO** | Service Level Objective | The target service level (e.g. p95 latency) |
| **OWASP LLM Top 10** | — | A catalog of risks for LLM applications |
