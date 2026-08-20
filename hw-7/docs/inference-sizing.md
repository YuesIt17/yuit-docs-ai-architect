# Inference sizing — Llama-3-70B @ 1000 RPM (RetailPartnerX)

Учебный расчёт capacity и стоимости self-hosted инференса для shopping assistant.
Цены — приближение к публичным прайсам на дату расчёта (авг 2026); перед закупкой сверять актуальные [Yandex Cloud](https://yandex.cloud/en/docs/compute/pricing) и [Cloud.ru](https://cloud.ru/products/vychislitelnyye-moschnosti-s-gpu).

Калькулятор для сверки весов: [LLM Model VRAM Calculator](https://huggingface.co/spaces/NyxKrage/LLM-Model-VRAM-Calculator).

Таблицы для сдачи: [calculations.html](calculations.html)  
(Pages: https://yuesit17.github.io/yuit-docs-ai-architect/hw-7/docs/calculations.html).

---

## 0. Допущения (RetailPartnerX)

| Параметр | Значение | Зачем |
| -------- | -------- | ----- |
| Модель | Meta Llama-3-70B Instruct | Self-hosted опция из [ADR-001](../../hw-4/docs/adr-001-llm-hosting.md) |
| Нагрузка | **1000 RPM** ≈ **16.7 RPS** | Задание |
| Средний контекст `seq_len` | **2048** токенов (prompt+RAG+ответ) | Чат shopping assistant, не 128k |
| Целевой p95 latency | **~4 с** end-to-end генерации | Согласуется с классом NFR hw-2 |
| Concurrent (Little’s law) | `RPM/60 × latency` ≈ **67** | Пиковая оценка in-flight запросов |
| Месяц | **730** GPU·часов | 24 × 30.42 |
| Курс | **1 USD = 95 ₽** | Для перевода прайса Yandex ($); зафиксирован как допущение |
| Overhead runtime | **5 GB** на реплику | CUDA graphs, activations, fragmentation |

Архитектура Llama-3-70B для KV (GQA):

- `n_layers = 80`, `n_kv_heads = 8`, `head_dim = 128`
- KV (FP16) на токен: `2 × 80 × 8 × 128 × 2 = 327 680 B ≈ **0.3125 MB/token**`
- Источник порядка величин: [HF Llama 3.1 blog](https://huggingface.co/blog/llama31), [mlsysim](https://mlsysbook.ai/mlsysim/blog/how-much-memory-llama3.html)

---

## 1. Hardware Sizing (VRAM)

### 1.1. Формула (критерий «Параметры × вес + KV Cache»)

```
Weights_GB = N_params × bytes_per_param / 1e9
KV_GB      = (0.3125/1024) × seq_len × concurrent   # GB
VRAM_GB    = Weights_GB + KV_GB + Overhead_GB
```

| Precision | bytes/param | N_params | **Weights** |
| --------- | ----------- | -------- | ----------- |
| FP16 | 2 | 70×10⁹ | **140.0 GB** |
| INT4 | 0.5 | 70×10⁹ | **35.0 GB** |

KV при `seq_len=2048`, `concurrent=67`:

| Метрика | Расчёт | Итог |
| ------- | ------ | ---- |
| KV на 1 запрос | 2048 × 0.3125 MB | **0.64 GB** |
| KV на 67 concurrent | 67 × 0.64 | **≈ 42.9 GB** |

| Режим | Weights | KV (67×2k) | Overhead | **Σ VRAM** |
| ----- | ------- | ---------- | -------- | ---------- |
| FP16 | 140.0 | 42.9 | 5.0 | **≈ 187.9 GB** |
| INT4 | 35.0 | 42.9 | 5.0 | **≈ 82.9 GB** |

> Квантование INT4 уменьшает **веса в 4 раза**, но KV (если не квантовать отдельно) остаётся большим — при высокой concurrency KV может доминировать. На практике vLLM часто держит KV в FP16/FP8; ниже в §3 учтём PagedAttention как эффективный прирост concurrent на ту же VRAM (~+30%).

### 1.2. Сколько GPU нужно (посадка по VRAM)

Спеки карт:

| GPU | VRAM | Примечание |
| --- | ---- | ---------- |
| **A100 80GB** | 80 GB | Основной candidate для 70B |
| **A100 40GB** | 40 GB | Только INT4 + малый batch / multi-GPU |
| **L4** | 24 GB | INT4 только с TP ≥ 2 |
| **T4** | 16 GB | INT4 с TP ≥ 3; FP16 непрактично |

#### FP16 (Σ ≈ 188 GB)

| Конфиг | Суммарный VRAM | Хватает? | Комментарий |
| ------ | -------------- | -------- | ----------- |
| 2× A100 80GB | 160 GB | Нет (не хватает ~28 GB на KV при 67 concurrent) | Нужен TP=2 + **снизить concurrent на реплику** или 3× GPU |
| **3× A100 80GB** | 240 GB | Да | Baseline для FP16 @ 1000 RPM |
| 4× A100 40GB | 160 GB | Нет / впритык | Как 2×80 без запаса |
| 5× A100 40GB | 200 GB | Да | Дороже по числу карт |
| L4 / T4 | — | Нет как разумный FP16 | Слишком много карт + низкая BW |

**Вывод FP16:** минимум **3× A100 80GB** (tensor parallel / pipeline) под целевой concurrent; либо 2× A100 80GB + лимит concurrent ≈ 40 (ниже целевого 1000 RPM без горизонтального шардирования реплик).

#### INT4 (Σ ≈ 83 GB)

| Конфиг | Суммарный VRAM | Хватает? | Комментарий |
| ------ | -------------- | -------- | ----------- |
| **1× A100 80GB** | 80 GB | Впритык (~83 нужн.) | Рабочий MVP при concurrent ≈ 55–60 или KV FP8 |
| **2× A100 80GB** | 160 GB | Да с запасом | Рекомендуемый prod-узел / шарда |
| 2× A100 40GB | 80 GB | Впритык | TP=2, малый запас |
| **2× L4 (24GB)** | 48 GB | Нет на 67 concurrent | Веса 35 + KV 43 > 48 |
| **4× L4** | 96 GB | Да | TP/реплики; ниже memory BW, чем A100 |
| **3× T4** | 48 GB | Нет | Только веса; KV не влезает |
| **6× T4** | 96 GB | Да теоретически | Много хопов TP, низкий throughput — не рекомендуем |

**Вывод INT4:** практичный минимум **1–2× A100 80GB**; L4 — только кластер **≥ 4× L4**; **T4 не рекомендуем** для Llama-3-70B на 1000 RPM.

### 1.3. Throughput vs «влезло в память»

VRAM — necessary, но не sufficient. Для 1000 RPM при ~200 output tokens/запрос ориентир decode ≈ 16.7 × 200 ≈ **3300 tok/s** суммарно по кластеру (грубо).

Эмпирический порядок (vLLM, INT4, A100 80GB, continuous batching): **~800–1500 tok/s на 1–2 GPU** в зависимости от prompt/output mix → для 1000 RPM обычно нужно **2–4 реплики** INT4 на A100, не одна карта «впритык по памяти».

В расчёте стоимости ниже берём:

| Сценарий | Конфиг GPU | Зачем |
| -------- | ---------- | ----- |
| A. FP16 baseline | **3× A100 80GB** × 1 шарда | Память + запас |
| B. INT4 conservative | **2× A100 80GB** × **2 шарды** = **4× A100** | Память + throughput |
| C. INT4 + vLLM optimized | **2× A100 80GB** × **1 шарда** = **2× A100** | Batching/PagedAttention поднимает util |
| D. INT4 на L4 | **4× L4** × **2 шарды** = **8× L4** | Альтернатива без A100 |

---

## 2. Cloud Selection (месяц)

Цены **только GPU** (без дисков/трафика) — нижняя оценка OpEx.

### 2.1. Yandex Cloud

Источник: [Compute pricing](https://yandex.cloud/en/docs/compute/pricing) (on-demand, не preemptible).

| GPU | Цена | ₽/час (×95) | ₽/мес (×730) |
| --- | ---- | ----------- | ------------ |
| 1× NVIDIA **A100** | **$3.345** / GPU·час | ≈ 318 ₽ | ≈ **232 000 ₽** |
| 1× NVIDIA **T4** | **$0.576** / GPU·час | ≈ 55 ₽ | ≈ **40 000 ₽** |
| **L4** | В публичной таблице не выделен отдельно | — | См. Cloud.ru / запрос квоты |

### 2.2. Cloud.ru (Evolution Compute GPU)

Источник: публичные тарифы Evolution (A100 PCIe, с НДС), напр. 1×A100 80GB ≈ **317.20 ₽/час**.

| Конфиг VM | ₽/час (с НДС) | ₽/мес (×730) | На 1 GPU |
| --------- | ------------- | ------------ | -------- |
| 1× A100 80GB (20 vCPU / 125 GB) | **317.20** | ≈ **231 600 ₽** | ≈ 231 600 |
| 2× A100 80GB | **634.40** | ≈ **463 100 ₽** | — |
| 1× A100 40GB | **256.20** | ≈ **187 000 ₽** | — |
| L4 | Публично нестабильно → **оценка 220 ₽/час** | ≈ **160 600 ₽** | Помечено как estimate |

Cloud.ru ML Inference (альтернатива managed): 1×A100 NVLink ≈ **353.80 ₽/час** — дороже raw VM, меньше ops.

### 2.3. AWS (us-east-1, on-demand)

Источники: [EC2 on-demand](https://aws.amazon.com/ec2/pricing/on-demand/), обзоры P4/G6 (авг 2026). После снижения цен P4 (2025) ориентир:

| GPU / инстанс | Цена | ₽/час (×95) | ₽/мес на 1 GPU |
| ------------- | ---- | ----------- | -------------- |
| **A100 80GB** (доля `p4de.24xlarge` $27.45 ÷ 8) | **≈ $3.43** / GPU·час | ≈ 326 ₽ | ≈ **238 000 ₽** |
| **A100 40GB** (доля `p4d.24xlarge` $21.96 ÷ 8) | **≈ $2.75** / GPU·час | ≈ 261 ₽ | ≈ **191 000 ₽** |
| **L4** (`g6.xlarge`) | **≈ $0.80–0.98** / час | ≈ 76–93 ₽ | ≈ **55–68k ₽** |
| **T4** (`g4dn.xlarge`) | **≈ $0.53** / час | ≈ 50 ₽ | ≈ **37 000 ₽** |

**Caveat:** A100 на AWS обычно продаётся **пакетом 8 GPU** (p4d/p4de). Для сценария «ровно 2×A100» либо платите за недогруз 8-карточный узел, либо уходите на L4/другие семейства.

### 2.4. Google Cloud (us, on-demand)

Источники: [Accelerator-optimized pricing](https://cloud.google.com/products/compute/pricing/accelerator-optimized).

| GPU / VM | Цена | ₽/час (×95) | ₽/мес на 1 GPU |
| -------- | ---- | ----------- | -------------- |
| **A100 80GB** (`a2-ultragpu-1g`) | **≈ $5.07** / час | ≈ 482 ₽ | ≈ **352 000 ₽** |
| **A100 40GB** (`a2-highgpu-1g`) | **≈ $3.67** / час | ≈ 349 ₽ | ≈ **255 000 ₽** |
| **L4** (`g2-standard-4`) | **≈ $0.70** / час | ≈ 67 ₽ | ≈ **49 000 ₽** |
| **T4** (GPU + N1, ориентир) | **≈ $0.35–0.73** | ≈ 33–69 ₽ | ≈ **24–50k ₽** |

На GCP можно взять **1× A100** без обязательного 8-GPU SKU — удобнее для sizing 2×A100, но **$/час A100 80GB заметно выше**, чем у RU-облаков и AWS per-GPU.

### 2.5. Сводка: цена 1× A100 80GB · мес

| Облако | ≈ ₽ / GPU·мес | Комментарий |
| ------ | ------------- | ----------- |
| Cloud.ru | **~232k** | паритет с Yandex |
| Yandex Cloud | **~232k** | 152-ФЗ / квоты |
| AWS (per-GPU доля p4de) | **~238k** | близко по цене; SKU часто 8× |
| **GCP** (`a2-ultragpu-1g`) | **~352k** | **дороже ~1.5×** |

### 2.6. Сводка стоимости сценариев (₽/мес, только GPU)

| Сценарий | GPUs | Yandex | Cloud.ru | AWS* | GCP |
| -------- | ---- | ------ | -------- | ---- | --- |
| A. FP16 · 3×A100 | 3 | ≈ **696k** | ≈ **695k** | ≈ **714k** | ≈ **1 056k** |
| B. INT4 · 4×A100 | 4 | ≈ **928k** | ≈ **926k** | ≈ **952k** | ≈ **1 408k** |
| **C. INT4+vLLM · 2×A100** | **2** | ≈ **464k** | ≈ **463k** | ≈ **476k** | ≈ **704k** |
| D. INT4 · 8×L4 | 8 | н/д | ≈ **1 285k** (est.) | ≈ **440–544k** | ≈ **392k** |

\*AWS — *эффективная* цена 2/3/4 GPU как доля от прайса; реально для A100 часто нужен узел на 8 карт (**×4 к сценарию C → ~1.9M ₽/мес**), если нет других SKU.

**Вывод по облакам:** по «голой» цене A100 Yandex ≈ Cloud.ru ≈ AWS per-GPU; **GCP дороже**. Для RetailPartnerX (ритейл РФ, риск R6 / 152-ФЗ) рациональнее **Yandex или Cloud.ru**. AWS/GCP — если уже multi-cloud / нет требования data residency; на AWS смотреть L4 (`g6`) или квоты на меньшие GPU-формы, не только p4de.

---

## 3. Optimization (Batching / vLLM)

| Техника | Эффект на VRAM | Эффект на $/токен | Оценка экономии vs naive |
| ------- | -------------- | ----------------- | ------------------------ |
| **INT4 (AWQ/GPTQ)** | Веса 140→35 GB | Можно уйти с 3×A100 FP16 на 2×A100 | **~33–50%** GPU vs FP16 при той же нагрузке |
| **Continuous batching** | Выше util при том же KV budget | Больше RPM на карту | **+1.5–3×** throughput |
| **vLLM PagedAttention** | −фрагментация KV (~+20–40% concurrent) | Меньше реплик | **~30–40%** GPU vs без paging |
| **KV FP8** (опционально) | KV ÷ ~2 | Ещё запас concurrent | Доп. **10–20%** |

**Прогноз для RetailPartnerX @ 1000 RPM:**

| Путь | GPU | ₽/мес (Cloud.ru ≈) | vs FP16 baseline |
| ---- | --- | ------------------ | ---------------- |
| FP16, weak batching (A) | 3×A100 | ~695k | 100% |
| INT4 + vLLM (C) | 2×A100 | ~463k | **≈ −33%** |
| INT4 без vLLM, 2 шарды (B) | 4×A100 | ~926k | хуже (перестраховка по throughput) |

Связка **INT4 + vLLM** даёт лучший TCO: квантование освобождает VRAM под KV/batch, continuous batching заполняет GPU, PagedAttention удерживает concurrent без лишних реплик.

Ожидаемая экономия относительно «FP16 на 3×A100 без оптимизаций»: **порядка 30–40% OpEx** при сохранении целевого RPM (сценарий C vs A). Относительно «INT4 без batching с лишними репликами» (B): экономия до **~50%**.

---

## 4. Вывод (кратко)

См. также отдельный файл сдачи: [recommendation.md](recommendation.md).

**Рекомендация:** self-hosted **Llama-3-70B INT4 (AWQ) на vLLM**, **2× NVIDIA A100 80GB**; облако для RetailPartnerX — **Yandex Cloud или Cloud.ru** (~463–464k ₽/мес). AWS per-GPU близок по цене, но A100 часто только пакетом 8×; **GCP A100 80GB ~1.5× дороже**. L4-кластер на AWS/GCP может быть дешевле сценария D, но слабее A100 по bandwidth.

FP16 — для eval, не для serving 1000 RPM. **T4 не использовать** для 70B на этой нагрузке.

Связь с ADR-001: OpEx self-hosted (~0.46M ₽/мес) сравнивать с SaaS; плюс фактор **data residency** при выборе AWS/GCP vs RU-cloud.
