# Assignment hw-7 — RetailPartnerX

**Sizing: calculating infrastructure resources and inference cost**

> **Abbreviations:** [Glossary](Glossary.md) · **Artifacts:** [docs/](docs/)

## Goal

Calculate LLM inference resources and cost for a given load and choose the optimal hardware configuration, taking optimizations into account (quantization, batching, vLLM).

## Context and Continuity

| Assignment | Artifact | Link to hw-7 |
| --------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------ |
| [hw-1](../hw-1/RetailPartnerX_AI_Strategy.md) | Strategy, PoC→MVP→Prod roadmap | Capacity planning as load grows |
| [hw-2](../hw-2/diagrams/README.md) | AI Service, LLM Client, latency NFR | The latency budget affects concurrent = RPM × latency |
| [hw-3](../hw-3/README.md) | Multi-agent RAG shopping assistant | The main consumer of LLM tokens in chat |
| [hw-4](../hw-4/docs/adr-001-llm-hosting.md) | ADR: SaaS for PoC/MVP, self-hosted on the roadmap | hw-7 is the **TCO estimate of self-hosted Llama-3-70B** as a trigger for revisiting the ADR |
| [hw-5](../hw-5/docs/data-pipeline.md) | Data plane | Not part of GPU inference; data plane cost is separate |
| [hw-6](../hw-6/docs/quality-assurance.md) | Observability | GPU util / queue depth metrics to validate the sizing |

**Task:** for RetailPartnerX, estimate self-hosted inference of **Llama-3-70B** (FP16 and INT4) at **1000 RPM** — VRAM/GPU, cost in Yandex / Cloud.ru / AWS / GCP, and the effect of Batching and vLLM.

The course topic is preserved; the calculation is tied to the shopping assistant and ADR-001 (self-hosted as an option if unit-cost grows).

## Steps (Solution Artifacts)

| Assignment step | Document / file |
| ------------------ | ----------------------------------------------------------------- |
| 1. Hardware Sizing | [docs/inference-sizing.md](docs/inference-sizing.md) §2–4         |
| 2. Cloud Selection | [docs/inference-sizing.md](docs/inference-sizing.md) §5–6         |
| 3. Optimization    | [docs/inference-sizing.md](docs/inference-sizing.md) §7           |
| 4. Conclusion | [docs/recommendation.md](docs/recommendation.md) · TL;DR in the sizing document |

## Submission Format

| Artifact | Path |
| ------------------ | ---------------------------------------------------- |
| Calculations (Markdown) | [docs/inference-sizing.md](docs/inference-sizing.md) |
| Short conclusion | [docs/recommendation.md](docs/recommendation.md) |

## Self-Check Criteria

| Criterion | How it is met |
| ----------------- | -------------------------------------------------------------- |
| VRAM accuracy | Weights + KV Cache + overhead — [§2](docs/inference-sizing.md) |
| Cloud comparison | Yandex, Cloud.ru, AWS, GCP — [§5–6](docs/inference-sizing.md) |
| Optimization | INT4 + Batching/vLLM — [§7](docs/inference-sizing.md) |

## Useful Materials

| Material | Description |
| -------------------------------------------------------------------------------------------------- | -------------------- |
| [LLM Model VRAM Calculator](https://huggingface.co/spaces/NyxKrage/LLM-Model-VRAM-Calculator) | VRAM calculator |
| [Yandex Cloud Compute pricing](https://yandex.cloud/en/docs/compute/pricing) | GPU prices (A100, T4) |
| [Cloud.ru GPU](https://cloud.ru/products/vychislitelnyye-moschnosti-s-gpu) | A100 rental and more |
| [AWS EC2 on-demand](https://aws.amazon.com/ec2/pricing/on-demand/)                                 | P4d / G6 / G4dn      |
| [GCP accelerator pricing](https://cloud.google.com/products/compute/pricing/accelerator-optimized) | A2 / G2              |
| [Hugging Face: Llama 3.1 memory](https://huggingface.co/blog/llama31) | FP16/INT4 weights + KV |

## Competencies

Plan AI infrastructure: detailed on-prem/cloud resource calculation and choosing a GPU configuration for LLM hosting.
