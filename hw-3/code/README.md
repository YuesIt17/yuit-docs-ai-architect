# Прототип Shopping Assistant (hw-3)



LangGraph stub: 6 агентов без API-ключей. Архитектура — [docs/agents.md](../docs/agents.md).



## Структура



| Путь | Назначение |

|------|------------|

| [shopping_assistant/](shopping_assistant/) | Модуль: граф, данные, `build_app()` |

| [tests/](tests/) | pytest |

| [notebooks/shopping_assistant_demo.ipynb](notebooks/shopping_assistant_demo.ipynb) | Демо в Jupyter / Colab |

| [tools/python/](../../tools/python/) | Общие зависимости Python для всех hw-* |



## 1. Подготовка окружения



Нужен **Python 3.10+** ([python.org/downloads](https://www.python.org/downloads/)). Один venv на **корень репозитория** — см. [tools/python/README.md](../../tools/python/README.md).



Из корня репозитория (если вы в `hw-3/code`, сначала поднимитесь на два уровня):

```powershell
cd ..\..

python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -U pip
pip install -r tools/python/requirements.txt
```



Linux / macOS:



```bash
cd ../..

python -m venv .venv
source .venv/bin/activate
pip install -r tools/python/requirements.txt
```



## 2. Запуск тестов (основная проверка)



Из **корня репозитория** (venv активирован):



```powershell
cd ..\..

python -m pytest hw-3/code/tests -q
```



Подробный вывод:



```powershell

python -m pytest hw-3/code/tests -v

```



> Не вызывайте просто `pytest`, если видите `pytest : The term 'pytest' is not recognized` — используйте `python -m pytest` (или активируйте venv, где pytest в PATH).



Ожидание: 7 passed — парсинг, RAG stub, корзина, happy path графа.



## 3. Запуск прототипа из CLI



Из корня (venv активирован):



```powershell

cd hw-3/code

python -c "from shopping_assistant import run_query; r = run_query(); print(r['final_answer'])"

```



## 4. Jupyter / Colab

### Локально (Jupyter / VS Code)

1. Открыть [notebooks/shopping_assistant_demo.ipynb](notebooks/shopping_assistant_demo.ipynb).
2. Kernel: `.venv` из **корня репозитория** (`pip install ipykernel` при необходимости).
3. **Run all** — пути к `shopping_assistant/` и `tools/python/requirements.txt` подставляются автоматически.

### Colab (для сдачи)

Код модуля не в одном файле — в Colab ноутбук **клонирует репозиторий** (см. первая code-ячейка).

1. Запушьте ветку на GitHub.
2. [Open in Colab](https://colab.research.google.com/github/YuesIt17/yuit-docs-ai-architect/blob/hw-3-multi-agent-rag/hw-3/code/notebooks/shopping_assistant_demo.ipynb) — или **File → Upload notebook** и загрузите `.ipynb` (тогда clone всё равно подтянет код с GitHub).
3. **Runtime → Run all**.
4. **File → Save a copy in Drive** → **Share → Anyone with the link**.
5. URL вида `https://colab.research.google.com/drive/...` вставьте в [hw-3/README.md](../README.md).

После merge в `main` замените в ноутбуке `REPO_BRANCH = "main"` и обновите Colab-ссылку на ветку `main`.



## 5. Что проверяет прототип



Сценарий: *«Собери ужин на 4 человека: паста, без глютена, бюджет до 2000 ₽»*.



- Intent Parser извлекает ограничения

- Catalog Searcher подбирает пасту, соус, сыр в бюджете

- Policy Analyst — keyword RAG + verdict

- Promo Analyst — stub акции 2+1

- Basket Assembler — mock `get_recommendation`

