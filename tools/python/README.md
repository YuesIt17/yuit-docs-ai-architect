# Python (общее окружение hw-*)

Зависимости и venv **на уровне репозитория** — один Python для всех ДЗ с кодом (`hw-3/code`, будущие `hw-*/code`).

## Быстрый старт

Из **корня репозитория**:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -U pip
pip install -r tools/python/requirements.txt
```

Linux / macOS:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r tools/python/requirements.txt
```

## Проверка (hw-3)

```powershell
python -m pytest hw-3/code/tests -q
```

## Разделение ответственности

| Что | Где |
|-----|-----|
| **Tool** (зависимости) | `tools/python/requirements.txt` |
| **venv / pytest cache** | корень репо: `.venv/`, `.pytest_cache/` |
| **Код ДЗ** | `{hwId}/code/` |
