# Глоссарий hw-4

Термины ADR и хостинга LLM для RetailPartnerX. Общие NFR, GDPR/152-ФЗ, ПДн — в [hw-1/Glossary.md](../hw-1/Glossary.md); LLM Client, RAG — в [hw-2/Glossary.md](../hw-2/Glossary.md).

| Термин | Расшифровка | Кратко |
|--------|-------------|--------|
| **ADR** | Architecture Decision Record | Короткий документ: контекст → решение → последствия |
| **MADR** | Markdown ADR | Markdown-шаблон ADR ([madr](https://adr.github.io/madr/)) |
| **SaaS LLM** | Software as a Service | Облачная проприетарная модель по API (напр. GPT) |
| **Self-hosted** | On-prem / свой контур | Open-source модель (напр. Llama 3) на своих GPU/серверах |
| **On-prem** | On-premises | Развёртывание в своём ЦОД/периметре (синоним self-hosted в контексте LLM) |
| **LLM Client** | — | Компонент AI Service (hw-2): абстракция вызова провайдера LLM |
| **Frontier-модель** | Frontier model | Топовая облачная LLM по качеству (instruction following, structured output) |
| **RAG** | Retrieval-Augmented Generation | Поиск в базе знаний + генерация ответа LLM — см. [hw-2](../hw-2/Glossary.md) |
| **DPA** | Data Processing Agreement | Договор обработки данных с облачным провайдером |
| **Vendor lock-in** | Привязка к вендору | Зависимость от API/цен/квот одного поставщика (риск R7) |
| **ПДн** | Персональные данные | Данные, идентифицирующие человека — см. [hw-1](../hw-1/Glossary.md); риск R6 |
| **GDPR / 152-ФЗ** | — | Регуляторика ЕС / РФ по защите ПДн — см. [hw-1](../hw-1/Glossary.md) |
| **OpEx** | Operating Expenditure | Операционные расходы (токены, подписка) |
| **CapEx** | Capital Expenditure | Капитальные затраты (GPU, стойки, лицензии железа) |
| **TCO** | Total Cost of Ownership | Полная стоимость владения (железо + люди + энергия vs токены) |
| **Unit-cost** | Себестоимость единицы | Стоимость одного запроса/токена при текущем объёме |
| **MLOps** | ML Operations | Эксплуатация ML/LLM: деплой, мониторинг, capacity, патчи |
| **TTM** | Time to Market | Срок вывода пилота/MVP на рынок |
| **PoC / MVP** | Proof of Concept / Minimum Viable Product | Пилот гипотезы → минимальный продукт в prod-канале |
| **Day-1** | С первого дня | Решение «сразу при старте», без отложенного roadmap |
| **Data residency** | Резидентность данных | Требование хранить/обрабатывать данные в заданной юрисдикции |
| **Утилизация** | Utilization | Доля реально занятого GPU/железа; низкая — idle CapEx не окупается |
