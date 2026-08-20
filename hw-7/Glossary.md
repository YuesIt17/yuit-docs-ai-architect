# Глоссарий hw-7

Термины sizing и инференса LLM. Хостинг SaaS vs self-hosted — [hw-4/Glossary.md](../hw-4/Glossary.md).

| Термин             | Расшифровка                   | Кратко                                                   |
| ------------------ | ----------------------------- | -------------------------------------------------------- |
| **VRAM**           | Video RAM                     | Память GPU: веса модели + KV Cache + overhead            |
| **FP16**           | Half precision                | 2 байта на параметр; Llama-3-70B ≈ 140 GB весов          |
| **INT4**           | 4-bit quantization            | ~0.5 байта на параметр; веса ≈ 35 GB; дешевле по VRAM    |
| **KV Cache**       | Key-Value Cache               | Кэш attention на токен; растёт с seq_len × concurrent    |
| **GQA**            | Grouped-Query Attention       | У Llama-3-70B 8 KV heads → компактнее KV, чем full MHA   |
| **TP**             | Tensor Parallelism            | Разрез модели по нескольким GPU                          |
| **RPM**            | Requests Per Minute           | 1000 RPM ≈ 16.7 RPS                                      |
| **RPS**            | Requests Per Second           | Instantaneous throughput                                 |
| **Batching**       | Continuous / dynamic batching | Несколько запросов на одном forward-pass → выше GPU util |
| **vLLM**           | —                             | Serving-движок: PagedAttention, continuous batching      |
| **PagedAttention** | —                             | Меньше фрагментации KV → больше concurrent на ту же VRAM |
| **AWQ / GPTQ**     | Weight-only quant             | Практичные форматы INT4 для vLLM/TGI                     |
| **TCO**            | Total Cost of Ownership       | Полная стоимость (GPU-часы + MLOps), см. hw-4            |
| **OpEx**           | Operating Expenditure         | Аренда GPU в облаке (помесячно)                          |
| **A100 / L4 / T4** | NVIDIA GPU                    | 80/40 GB · 24 GB · 16 GB VRAM                            |
| **Utilization**    | Утилизация                    | Доля занятого GPU; batching повышает её                  |
