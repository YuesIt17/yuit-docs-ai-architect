# Recommendation (Short Conclusion for Submission)

**Configuration:** Llama-3-70B **INT4 (AWQ/GPTQ)** + **vLLM**, hardware **2× NVIDIA A100 80GB**.

**Why:**
- FP16: weights **140 GB** + KV (~43 GB at 67 concurrent / 2k) ≈ **188 GB** → needs ≥ **3× A100 80GB**.
- INT4: weights **35 GB** + the same KV ≈ **83 GB** → **2× A100** with headroom for 1000 RPM.
- **Batching + vLLM** → savings of **~30–40%** vs the FP16 baseline.
- **T4** is not recommended; **L4** — only as a cluster of ≥4 cards.

**Cloud (1× A100 80GB · month):** Yandex / Cloud.ru **~232k ₽** ≈ AWS per-GPU **~238k** ≪ GCP **~352k**. For RetailPartnerX (152-FZ) — **Yandex or Cloud.ru**.

**Scenario C OpEx (2×A100):** ~**463–464k ₽/month** (RU); AWS* ~476k; GCP ~704k  
(*excluding the minimum 8-GPU SKU on AWS).

Full calculation with tables: [inference-sizing.md](inference-sizing.md).
