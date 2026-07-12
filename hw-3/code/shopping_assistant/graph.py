from __future__ import annotations

import re
from typing import TypedDict

import pandas as pd
from langgraph.graph import END, START, StateGraph

from shopping_assistant.data import (
    CATALOG,
    DINNER_CATEGORIES,
    POLICY_KB,
    USER_QUERY,
)

MESSAGES: list[str] = []


def log(agent: str, text: str) -> None:
    line = f"[{agent}] {text}"
    MESSAGES.append(line)


def clear_messages() -> None:
    MESSAGES.clear()


class AgentState(TypedDict):
    user_query: str
    constraints: dict
    policy_chunks: list[dict]
    policy_verdict: str
    cited_policy_ids: list[str]
    candidates: list[dict]
    cart: list[dict]
    promo_notes: list[str]
    final_answer: str


def parse_constraints(query: str) -> dict:
    persons = 4
    match = re.search(r"(\d+)\s*челов", query.lower())
    if match:
        persons = int(match.group(1))

    budget = 2000
    match = re.search(r"(\d+)\s*(?:₽|руб)", query.lower())
    if match:
        budget = int(match.group(1))

    return {
        "dish": "паста" if "паст" in query.lower() else "ужин",
        "persons": persons,
        "budget": budget,
        "gluten_free": "без глютена" in query.lower() or "gluten" in query.lower(),
    }


def policy_rag_retrieve(query: str, top_k: int = 2) -> list[dict]:
    tokens = set(re.findall(r"[а-яa-z0-9]+", query.lower()))
    scored: list[tuple[int, dict]] = []
    for chunk in POLICY_KB:
        words = set(re.findall(r"[а-яa-z0-9]+", chunk["text"].lower()))
        score = len(tokens & words)
        if "глютен" in query.lower() and "глютен" in chunk["text"].lower():
            score += 2
        if "акци" in query.lower() and "акци" in chunk["text"].lower():
            score += 2
        scored.append((score, chunk))
    scored.sort(key=lambda item: item[0], reverse=True)
    return [chunk for score, chunk in scored[:top_k] if score > 0] or POLICY_KB[:2]


def evaluate_policy_verdict(constraints: dict, candidates: list[dict]) -> tuple[str, list[str]]:
    if constraints.get("gluten_free"):
        for item in candidates:
            if not item.get("gluten_free", True):
                return "deny", ["POL-ALLERGEN-01", "POL-ALLERGEN-02"]
    return "allow", []


def search_dinner_candidates(constraints: dict, catalog: pd.DataFrame | None = None) -> list[dict]:
    df = (catalog if catalog is not None else CATALOG).copy()
    if constraints.get("gluten_free"):
        df = df[df["gluten_free"]]

    categories = list(DINNER_CATEGORIES)
    if constraints.get("dish") == "паста":
        categories = ["паста", "соусы", "сыры"]

    df = df[df["category"].isin(categories)]
    df = df.sort_values("price")

    selected: list[dict] = []
    total = 0
    used_categories: set[str] = set()

    for _, row in df.iterrows():
        category = row["category"]
        if category in used_categories:
            continue
        if total + row["price"] > constraints["budget"]:
            continue
        item = row.to_dict()
        selected.append(item)
        used_categories.add(category)
        total += row["price"]
        if len(selected) >= 3:
            break

    return selected


def apply_promos(candidates: list[dict], policy_chunks: list[dict]) -> tuple[list[dict], list[str]]:
    promo_ids = {chunk["policy_id"] for chunk in policy_chunks}
    notes: list[str] = []
    updated = [dict(item) for item in candidates]

    if "POL-PROMO-01" not in promo_ids:
        return updated, notes

    for item in updated:
        if item["sku"] == "SKU-102":
            item["promo"] = "2+1"
            notes.append("Акция 2+1 на соус томатный (POL-PROMO-01)")
            break

    return updated, notes


def mock_get_recommendation(candidates: list[dict]) -> list[dict]:
    return [dict(item) for item in candidates]


def orchestrator_node(state: AgentState) -> AgentState:
    log("Orchestrator", f"Получен запрос: {state['user_query']}")
    return state


def intent_parser_node(state: AgentState) -> AgentState:
    constraints = parse_constraints(state["user_query"])
    log("IntentParser", f"Извлечены ограничения: {constraints}")
    return {**state, "constraints": constraints}


def policy_analyst_node(state: AgentState) -> AgentState:
    chunks = policy_rag_retrieve(state["user_query"], top_k=3)
    verdict, cited = evaluate_policy_verdict(state["constraints"], state["candidates"])
    if not cited:
        cited = [chunk["policy_id"] for chunk in chunks[:2]]
    log(
        "PolicyAnalyst",
        f"RAG chunks={[chunk['policy_id'] for chunk in chunks]}, "
        f"verdict={verdict}, citations={cited}",
    )
    return {
        **state,
        "policy_chunks": chunks,
        "policy_verdict": verdict,
        "cited_policy_ids": cited,
    }


def catalog_searcher_node(state: AgentState) -> AgentState:
    constraints = state["constraints"]
    log(
        "CatalogSearcher",
        f"Ищу SKU: dish={constraints['dish']}, budget={constraints['budget']}, "
        f"gluten_free={constraints['gluten_free']}",
    )
    candidates = search_dinner_candidates(constraints)
    log(
        "CatalogSearcher",
        f"Найдено {len(candidates)} SKU: {[item['sku'] for item in candidates]}",
    )
    return {**state, "candidates": candidates}


def promo_analyst_node(state: AgentState) -> AgentState:
    if state["policy_verdict"] != "allow":
        return {**state, "promo_notes": []}

    candidates, notes = apply_promos(state["candidates"], state["policy_chunks"])
    log("PromoAnalyst", f"Promo notes={notes}")
    return {**state, "candidates": candidates, "promo_notes": notes}


def basket_assembler_node(state: AgentState) -> AgentState:
    if state["policy_verdict"] != "allow":
        return {**state, "cart": []}

    cart = mock_get_recommendation(state["candidates"])
    log("BasketAssembler", f"get_recommendation → {len(cart)} SKU")
    return {**state, "cart": cart}


def synthesize_node(state: AgentState) -> AgentState:
    if state["policy_verdict"] != "allow":
        answer = "Не могу подобрать товары: нарушение политики компании."
    elif not state["cart"]:
        answer = "Подходящих товаров не найдено. Уточните бюджет или ограничения."
    else:
        lines = [f"• {item['title']} ({item['sku']}) — {item['price']} ₽" for item in state["cart"]]
        promo = "\n".join(state.get("promo_notes", []))
        answer = "Корзина для ужина без глютена:\n" + "\n".join(lines)
        if promo:
            answer += "\n\n" + promo

    log("Orchestrator", "Синтез финального ответа")
    log("Orchestrator", answer.replace("\n", " | "))
    return {**state, "final_answer": answer}


def build_app():
    builder = StateGraph(AgentState)
    builder.add_node("orchestrator", orchestrator_node)
    builder.add_node("intent_parser", intent_parser_node)
    builder.add_node("policy_analyst", policy_analyst_node)
    builder.add_node("catalog_searcher", catalog_searcher_node)
    builder.add_node("promo_analyst", promo_analyst_node)
    builder.add_node("basket_assembler", basket_assembler_node)
    builder.add_node("synthesize", synthesize_node)

    builder.add_edge(START, "orchestrator")
    builder.add_edge("orchestrator", "intent_parser")
    builder.add_edge("intent_parser", "catalog_searcher")
    builder.add_edge("catalog_searcher", "policy_analyst")
    builder.add_edge("policy_analyst", "promo_analyst")
    builder.add_edge("promo_analyst", "basket_assembler")
    builder.add_edge("basket_assembler", "synthesize")
    builder.add_edge("synthesize", END)

    return builder.compile()


def run_query(query: str = USER_QUERY) -> AgentState:
    clear_messages()
    app = build_app()
    return app.invoke(
        {
            "user_query": query,
            "constraints": {},
            "policy_chunks": [],
            "policy_verdict": "",
            "cited_policy_ids": [],
            "candidates": [],
            "cart": [],
            "promo_notes": [],
            "final_answer": "",
        }
    )
