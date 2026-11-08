# LLM Hosting Comparison: SaaS vs Self-hosted

**Project:** RetailPartnerX — personal shopping assistant (chat, [hw-3](../../hw-3/README.md))  
**Stage:** PoC / MVP  
**Alternatives:** a proprietary cloud LLM (SaaS) vs open-source (Llama 3) on our own servers (Self-hosted)

Related risks from the [AI strategy](../../hw-1/RetailPartnerX_AI_Strategy.md): **R6** (personal data / GDPR / 152-FZ), **R7** (vendor lock-in), **R8** (hallucinations — addressed by RAG/guardrails, not by the hosting choice).

Compute cost reference: [Cloud vs On-prem LLM costs (a16z)](https://a16z.com/navigating-the-high-cost-of-ai-compute/).

## Criteria

| Criterion | SaaS (cloud frontier LLM) | Self-hosted (Llama 3 and similar) | Criterion importance for the MVP |
| -------- | ---------------------------- | ------------------------------- | ------------------------ |
| **Cost** | Token OpEx; at small pilot volume, cheaper thanks to no idle GPUs | GPU CapEx + electricity + idle hardware at low utilization | high |
| **Privacy** | Prompts and responses are with the vendor; requires a DPA, personal data minimization, no raw IDs in logs | Data stays inside the client's perimeter — stronger for strict data residency | high (risk R6: GDPR / 152-FZ / personal data) |
| **Answer quality** | Frontier models: better instruction following and structured output for the hw-3 agents | Lags without fine-tuning/evaluation; higher risk of degrading the assistant UX | high |
| **Latency** | RTT to the API + provider queue; hw-2 already includes Top-K and a cache before the LLM | Potentially lower network tail; GPU cold start and queueing on our own hardware | medium (p95) |
| **Support complexity** | Vendor SLA, model updates "out of the box" | Requires a GPU/MLOps team: deployment, monitoring, patches, capacity planning | high for the MVP |

## Weighted Conclusion

At the **PoC/MVP** stage, **SaaS** wins:

1. No GPU CapEx under unpredictable pilot load (see a16z: on-prem pays off at consistently high utilization).
2. Frontier model quality is critical for the multi-agent scenario (constraint parsing, answer synthesis) — see [hw-3](../../hw-3/README.md).
3. The team focuses on RAG, policies and agents, not on operating inference.
4. Privacy is addressed by process (DPA, personal data minimization), not by full on-prem — acceptable for the MVP under GDPR/152-FZ; if residency requirements tighten, escalate to Self-hosted.
5. **R7** is mitigated by the **LLM Client** abstraction ([hw-2](../../hw-2/diagrams/README.md)) and an explicit roadmap item: Self-hosted if unit-cost grows or Legal requires it.

**The decision is recorded in** [adr-001-llm-hosting.md](adr-001-llm-hosting.md).
