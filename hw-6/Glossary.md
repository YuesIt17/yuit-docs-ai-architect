# Глоссарий hw-6

Термины QA, Security и Observability для RetailPartnerX. Guardrails (агентный смысл) — в [hw-3/Glossary.md](../hw-3/Glossary.md); GDPR / R4–R8 — в [hw-1/Glossary.md](../hw-1/Glossary.md); RAG / Vector DB — в [hw-2/Glossary.md](../hw-2/Glossary.md).

| Термин | Расшифровка | Кратко |
|--------|-------------|--------|
| **PII Sanitizer** | Personally Identifiable Information Sanitizer | Маскирование ПДн в промпте и логах до отправки в LLM |
| **Prompt Injection** | Внедрение инструкций в промпт | Атака «игнорируй политику» / jailbreak (OWASP LLM01) |
| **Input Guard** | Входной ограничитель | Фильтр injection и небезопасных запросов до Orchestrator |
| **Output Guardrails** | Выходные ограничители | Валидация ответа LLM: blocklist, citations, schema |
| **Secret Manager** | Менеджер секретов | Хранение и ротация API keys вне кода сервиса |
| **Faithfulness** | Верность фактам контекста | Доля утверждений ответа, подтверждённых RAG-чанками |
| **Answer Relevancy** | Релевантность ответа | Насколько ответ соответствует вопросу пользователя |
| **Context Precision** | Точность контекста | Доля полезных чанков в Top-K retrieval |
| **Context Recall** | Полнота контекста | Нужные факты из gold попали ли в retrieved set |
| **Ragas** | RAG Assessment | Библиотека offline-метрик качества RAG |
| **DeepEval** | — | Фреймворк LLM/RAG-тестов, удобен для CI-гейтов |
| **Golden Signals** | Latency, Traffic, Errors, Saturation | Базовые SRE-сигналы сервиса (Google SRE) |
| **Langfuse** | — | Трейсинг LLM-вызовов, tokens и cost |
| **Prometheus** | — | Сбор и хранение метрик для Grafana |
| **Tempo** | Grafana Tempo | Распределённые traces (часто с OpenTelemetry) |
| **SLO** | Service Level Objective | Целевой уровень сервиса (напр. p95 latency) |
| **OWASP LLM Top 10** | — | Каталог рисков приложений на LLM |
