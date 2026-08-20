# Рекомендация (краткий вывод для сдачи)

**Конфигурация:** Llama-3-70B в **INT4 (AWQ/GPTQ)** на **vLLM**, железо **2× NVIDIA A100 80GB**.

**Почему:**
- FP16: веса **140 GB** + KV (~43 GB при 67 concurrent / 2k) ≈ **188 GB** → нужно ≥ **3× A100 80GB**.
- INT4: веса **35 GB** + тот же KV ≈ **83 GB** → влезает в **1–2× A100**; для 1000 RPM с запасом по throughput — **2× A100**.
- Квантование снижает VRAM → можно не покупать лишние карты; **batching + vLLM (PagedAttention)** поднимают util и concurrent → прогноз экономии **~30–40%** vs FP16 baseline и до **~50%** vs INT4 без оптимизаций с лишними репликами.
- **T4** для 70B @ 1000 RPM не рекомендуем; **L4** — только кластер ≥4 карт и хуже по memory bandwidth.

**Облако (1× A100 80GB · мес):** Cloud.ru / Yandex **~232k ₽** ≈ AWS per-GPU **~238k ₽** ≪ GCP **~352k ₽**. Для RetailPartnerX (152-ФЗ) — **Yandex или Cloud.ru**. AWS: близкая цена, но A100 часто только **8-GPU** SKU. GCP: удобный 1×A100, но дороже.

**Оценка OpEx сценария C (2×A100, ~730 ч/мес):** Yandex/Cloud.ru **~463–464k ₽**; AWS* **~476k**; GCP **~704k** (*без учёта минимального 8-GPU узла).

Полный расчёт: [inference-sizing.md](inference-sizing.md) · таблицы: [calculations.html](calculations.html).
