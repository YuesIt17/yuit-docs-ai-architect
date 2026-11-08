# hw-7 Glossary

Terms for LLM **sizing** (resource calculation) and **inference** for RetailPartnerX.  
SaaS vs self-hosted, TCO/OpEx in the ADR context — [hw-4/Glossary.md](../hw-4/Glossary.md).  
NFR / latency — [hw-2/Glossary.md](../hw-2/Glossary.md).

Calculations: [inference-sizing.md](docs/inference-sizing.md).

---

## Memory and Number Formats

### VRAM (Video RAM)

Memory on the graphics card that holds, during inference:

1. the **model weights** (parameters);
2. the **KV Cache** for active requests;
3. **overhead** — CUDA buffers, activations, fragmentation.

VRAM is most often what limits whether Llama-3-70B "fits" on an A100 / L4 / T4. In hw-7:  
`VRAM ≈ Weights + KV + overhead`.

### FP16 (Half precision)

Number format: **2 bytes** per parameter (half of FP32).  
For Llama-3-70B the weights are ≈ **70B × 2 ≈ 140 GB** — a single A100 80GB cannot hold the model without splitting it across several GPUs.

Pro: higher quality / easier debugging. Con: expensive in memory and GPU rental under high load.

### INT4 (4-bit quantization)

Compressing weights to **~0.5 bytes** per parameter (quantization).  
Llama-3-70B weights are ≈ **35 GB** instead of 140 GB — the model more often fits on 1–2× A100.

Pro: less VRAM → fewer/cheaper GPUs. Con: a small quality drop; for serving, ready-made **AWQ / GPTQ** schemes are usually used rather than "raw" INT4.

### KV Cache (Key–Value Cache)

During text generation, attention reuses the already computed keys (K) and values (V) of previous tokens. They are kept in VRAM as the **KV Cache** so that everything does not have to be recomputed from scratch.

Its size grows almost linearly with:

- context length (`seq_len`);
- the number of simultaneous requests (`concurrent`).

In hw-7, at 2048 tokens and ~67 concurrent, KV ≈ **43 GB** — sometimes more than the INT4 weights. So "the model fits" alone is not enough: headroom for KV is needed.

### GQA (Grouped-Query Attention)

An attention variant where several query heads share common KV heads. Llama-3-70B has **8 KV heads** instead of a full set — the KV Cache is noticeably more compact than in older models with Multi-Head Attention (MHA).

Without GQA, the memory calculation for concurrent requests would be even tighter.

### Overhead

VRAM headroom beyond the weights and KV: CUDA cores, temporary tensors, page alignment. The hw-7 calculation assumes **~5 GB** per replica as a simplified margin.

---

## Parallelism and Hardware

### TP (Tensor Parallelism)

Splitting **one** model across several GPUs: layers/matrices are computed jointly (requires a fast interconnect, e.g. NVLink).  
Example: FP16 140 GB → at least **2–3× A100**, because the weights do not fit on one card.

Not to be confused with **replicas** (several copies of the model to grow RPM) — hw-7 scenario B is exactly "2 shards × 2 GPUs".

### A100 / L4 / T4 (NVIDIA GPU)

| Card | Typical VRAM | For Llama-3-70B @ 1000 RPM |
| ----- | ------------- | -------------------------- |
| **A100** | 40 or **80 GB** | the main choice (recommendation: 2×80 GB INT4) |
| **L4** | **24 GB** | cluster only (≥4 cards), weaker memory bandwidth |
| **T4** | **16 GB** | **not recommended** for 70B at the target load |

The less VRAM and bandwidth, the more cards are needed and the harder it is to meet latency.

### Utilization

The share of GPU time/resources actually doing useful work.  
Without batching, the GPU often sits idle between single requests → you pay for the card while tokens/sec stay low. Continuous batching and vLLM raise utilization.

---

## Load and Serving

### RPM / RPS

- **RPM** — Requests Per Minute. The assignment target: **1000 RPM**.
- **RPS** — Requests Per Second ≈ RPM / 60 → **≈ 16.7 RPS**.

Link to concurrency (Little’s law):  
`concurrent ≈ RPS × latency_sec`  
(in hw-7: 16.7 × 4 ≈ **67** simultaneous in-flight requests).

### Batching (continuous / dynamic)

Combining several user requests into one (or a continuous) pass through the model, instead of "one request — one idle GPU".

Effect: higher utilization and throughput (tokens/sec), fewer GPUs for the same RPM. The hw-7 estimate is about **+1.5–3×** throughput vs naive.

### vLLM

An open-source **serving engine** for LLMs (not the model itself). Provides continuous batching and **PagedAttention**, convenient for prod inference (including with AWQ/GPTQ).

The hw-7 recommendation: **Llama-3-70B INT4 + vLLM** on 2× A100.

### PagedAttention

A technique for managing the KV Cache by analogy with virtual memory / paging: less memory **fragmentation**, so more concurrent requests fit in the same VRAM (reference: **+20–40%**).

This is why INT4 + vLLM can make do with **2× A100** instead of inflating the replica count "just in case".

### AWQ / GPTQ

Practical **weight-only** quantization schemes in INT4 (weights are compressed, computation often runs at a higher precision). Well supported by vLLM / TGI — this is what people usually mean by "INT4 in prod", not an abstract 4-bit.

---

## Cost

### OpEx (Operating Expenditure)

Operating expenses: monthly cloud **GPU rental**, traffic, support.  
hw-7 mainly compares GPU·hours (Yandex, Cloud.ru, AWS, GCP).

### TCO (Total Cost of Ownership)

Total cost of ownership: OpEx + people (MLOps) + downtime/quotas + risks (152-FZ, vendor lock-in).  
See also [hw-4](../hw-4/Glossary.md): TCO is the argument for when self-hosted starts to beat SaaS as RPM grows.

### On-demand (in the Cloud)

Paying for GPUs **by actual usage** without long-term reserved/CUD. Convenient for estimates in the assignment; in prod, Reserved / Spot / CUD are often cheaper under stable load.

---

## Quick Index

| Term | In one phrase |
| ------ | ------------ |
| VRAM | GPU memory: weights + KV + overhead |
| FP16 | 2 B/param → ~140 GB of weights for 70B |
| INT4 | ~0.5 B/param → ~35 GB of weights |
| KV Cache | Attention cache; grows with length and concurrency |
| GQA | Fewer KV heads → more compact cache |
| TP | One model on several GPUs |
| RPM / RPS | 1000/min ≈ 16.7/sec |
| Batching | Several requests → higher utilization |
| vLLM | Serving with PagedAttention |
| AWQ/GPTQ | INT4 for production inference |
| OpEx / TCO | GPU rental / total cost |
| A100 / L4 / T4 | 80·40 / 24 / 16 GB VRAM |
