# hw-4 Glossary

Terms for ADRs and LLM hosting for RetailPartnerX. General NFR, GDPR/152-FZ and personal data terms are in [hw-1/Glossary.md](../hw-1/Glossary.md); LLM Client and RAG are in [hw-2/Glossary.md](../hw-2/Glossary.md).

| Term | Expansion | In short |
|--------|-------------|--------|
| **ADR** | Architecture Decision Record | A short document: context → decision → consequences |
| **MADR** | Markdown ADR | A Markdown ADR template ([madr](https://adr.github.io/madr/)) |
| **SaaS LLM** | Software as a Service | A proprietary cloud model via API (e.g. GPT) |
| **Self-hosted** | On-prem / own environment | An open-source model (e.g. Llama 3) on your own GPUs/servers |
| **On-prem** | On-premises | Deployment in your own data center/perimeter (a synonym of self-hosted in the LLM context) |
| **LLM Client** | — | An AI Service component (hw-2): abstraction over calling the LLM provider |
| **Frontier model** | Frontier model | A top-quality cloud LLM (instruction following, structured output) |
| **RAG** | Retrieval-Augmented Generation | Knowledge base search + LLM answer generation — see [hw-2](../hw-2/Glossary.md) |
| **DPA** | Data Processing Agreement | A data processing agreement with the cloud provider |
| **Vendor lock-in** | Vendor lock-in | Dependence on one supplier's API/prices/quotas (risk R7) |
| **Personal data** | Personal data | Data that identifies a person — see [hw-1](../hw-1/Glossary.md); risk R6 |
| **GDPR / 152-FZ** | — | EU / Russian personal data protection regulation — see [hw-1](../hw-1/Glossary.md) |
| **OpEx** | Operating Expenditure | Operating expenses (tokens, subscription) |
| **CapEx** | Capital Expenditure | Capital expenses (GPUs, racks, hardware licenses) |
| **TCO** | Total Cost of Ownership | Full cost of ownership (hardware + people + power vs tokens) |
| **Unit-cost** | Unit cost | The cost of one request/token at the current volume |
| **MLOps** | ML Operations | Operating ML/LLM: deployment, monitoring, capacity, patches |
| **TTM** | Time to Market | Time to bring a pilot/MVP to market |
| **PoC / MVP** | Proof of Concept / Minimum Viable Product | A hypothesis pilot → a minimal product in a prod channel |
| **Day-1** | From day one | A decision made "right at the start", not deferred to the roadmap |
| **Data residency** | Data residency | A requirement to store/process data in a given jurisdiction |
| **Utilization** | Utilization | The share of GPU/hardware actually in use; when low, idle CapEx does not pay off |
