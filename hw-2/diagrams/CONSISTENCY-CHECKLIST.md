# Чеклист связности hw-2

Пройти перед сдачей. Критерии из [README.md](../README.md) и [Glossary.md](../Glossary.md).

## C2 — контейнеры

- [x] Frontend, Backend, AI Service, SQL DB, Vector DB присутствуют
- [x] На C2 нет Recommendation Controller / RAG Manager (только на C3)
- [x] Стрелка Backend → AI Service подписана `get_recommendation` / REST

## C3 recsys ↔ Sequence

| Компонент C3 | Участник Sequence |
|--------------|-------------------|
| Recommendation Controller | Recommendation Controller |
| Scenario Router | Scenario Router |
| Candidate Loader | Candidate Loader |
| Ranker | Ranker |
| Response Builder | Response Builder |

- [x] Сценарий: карточка товара, `context=product_page`
- [x] Вызов `POST /get_recommendation` от Backend к Controller

## Sequence ↔ OpenAPI

- [x] Endpoint: `POST /get_recommendation`
- [x] Поля запроса: `user_id`, `context`, `product_id`, `limit`
- [x] Ответ: `recommendations[]` с `sku_id`, `score`, `title`
- [x] Коды ошибок: 400, 404, 503, 500

## Draw.io

- [x] 5 файлов `.drawio` в [drawio/](drawio/) (генератор `generate_drawio.mjs`)
- [ ] Визуально сверены с Mermaid в diagrams.net (при необходимости — правки layout / C4 shapes)

## RAG future

- [x] RAG C3 не участвует в Sequence/OpenAPI MVP (отдельный файл, помечен в README)
