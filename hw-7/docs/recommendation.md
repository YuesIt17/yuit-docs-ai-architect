# Рекомендация (краткий вывод для сдачи)

**Конфигурация:** Llama-3-70B **INT4 (AWQ/GPTQ)** + **vLLM**, железо **2× NVIDIA A100 80GB**.

**Почему:**
- FP16: веса **140 GB** + KV (~43 GB при 67 concurrent / 2k) ≈ **188 GB** → нужно ≥ **3× A100 80GB**.
- INT4: веса **35 GB** + тот же KV ≈ **83 GB** → **2× A100** с запасом под 1000 RPM.
- **Batching + vLLM** → экономия **~30–40%** vs FP16 baseline.
- **T4** не рекомендуем; **L4** — только кластер ≥4 карт.

**Облако (1× A100 80GB · мес):** Yandex / Cloud.ru **~232k ₽** ≈ AWS per-GPU **~238k** ≪ GCP **~352k**. Для RetailPartnerX (152-ФЗ) — **Yandex или Cloud.ru**.

**OpEx сценария C (2×A100):** ~**463–464k ₽/мес** (RU); AWS* ~476k; GCP ~704k  
(*без учёта минимального 8-GPU SKU на AWS).

Полный расчёт с таблицами: [inference-sizing.md](inference-sizing.md).
