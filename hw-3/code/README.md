# Shopping Assistant Prototype (hw-3)



LangGraph stub: 6 agents with no API keys. Architecture — [docs/agents.md](../docs/agents.md).



## Structure



| Path | Purpose |

|------|------------|

| [shopping_assistant/](shopping_assistant/) | Module: graph, data, `build_app()` |

| [tests/](tests/) | pytest |

| [notebooks/shopping_assistant_demo.ipynb](notebooks/shopping_assistant_demo.ipynb) | Demo in Jupyter / Colab |

| [tools/python/](../../tools/python/) | Shared Python dependencies for all hw-* |



## 1. Environment Setup



Requires **Python 3.10+** ([python.org/downloads](https://www.python.org/downloads/)). One venv at the **repository root** — see [tools/python/README.md](../../tools/python/README.md).



From the repository root (if you are in `hw-3/code`, first go up two levels):

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



## 2. Running the Tests (Main Check)



From the **repository root** (venv activated):



```powershell
cd ..\..

python -m pytest hw-3/code/tests -q
```



Verbose output:



```powershell

python -m pytest hw-3/code/tests -v

```



> Do not call plain `pytest` if you see `pytest : The term 'pytest' is not recognized` — use `python -m pytest` (or activate the venv where pytest is on PATH).



Expected: 7 passed — parsing, RAG stub, cart, graph happy path.



## 3. Running the Prototype from the CLI



From the root (venv activated):



```powershell

cd hw-3/code

python -c "from shopping_assistant import run_query; r = run_query(); print(r['final_answer'])"

```



## 4. Jupyter / Colab

### Locally (Jupyter / VS Code)

1. Open [notebooks/shopping_assistant_demo.ipynb](notebooks/shopping_assistant_demo.ipynb).
2. Kernel: `.venv` from the **repository root** (`pip install ipykernel` if needed).
3. **Run all** — the paths to `shopping_assistant/` and `tools/python/requirements.txt` are filled in automatically.

### Colab (for Submission)

The module code is not in a single file, so in Colab the notebook **clones the repository** (see the first code cell).

1. Push the branch to GitHub.
2. [Open in Colab](https://colab.research.google.com/github/YuesIt17/yuit-docs-ai-architect/blob/hw-3-multi-agent-rag/hw-3/code/notebooks/shopping_assistant_demo.ipynb) — or **File → Upload notebook** and upload the `.ipynb` (the clone will still pull the code from GitHub).
3. **Runtime → Run all**.
4. **File → Save a copy in Drive** → **Share → Anyone with the link**.
5. Paste the URL of the form `https://colab.research.google.com/drive/...` into [hw-3/README.md](../README.md).

After merging into `main`, set `REPO_BRANCH = "main"` in the notebook and update the Colab link to the `main` branch.



## 5. What the Prototype Checks



Scenario: *"Build a dinner for 4 people: pasta, gluten-free, budget up to 2000 ₽"*.



- The Intent Parser extracts constraints

- The Catalog Searcher selects pasta, sauce and cheese within the budget

- Policy Analyst — keyword RAG + verdict

- The Promo Analyst — a 2+1 promotion stub

- Basket Assembler — mock `get_recommendation`

