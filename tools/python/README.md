# Python (Shared hw-* Environment)

Dependencies and venv are **at the repository level** — one Python for all assignments with code (`hw-3/code`, future `hw-*/code`).

## Quick Start

From the **repository root**:

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

## Check (hw-3)

```powershell
python -m pytest hw-3/code/tests -q
```

## Separation of Responsibilities

| What | Where |
|-----|-----|
| **Tool** (dependencies) | `tools/python/requirements.txt` |
| **venv / pytest cache** | repo root: `.venv/`, `.pytest_cache/` |
| **Assignment code** | `{hwId}/code/` |
