from shopping_assistant import (
    USER_QUERY,
    apply_promos,
    build_app,
    evaluate_policy_verdict,
    parse_constraints,
    policy_rag_retrieve,
    run_query,
    search_dinner_candidates,
)
from shopping_assistant.data import POLICY_KB


def test_parse_constraints():
    constraints = parse_constraints(USER_QUERY)
    assert constraints["persons"] == 4
    assert constraints["budget"] == 2000
    assert constraints["gluten_free"] is True
    assert constraints["dish"] == "паста"


def test_policy_rag_retrieve_gluten():
    chunks = policy_rag_retrieve(USER_QUERY, top_k=3)
    ids = {chunk["policy_id"] for chunk in chunks}
    assert "POL-ALLERGEN-01" in ids or "POL-ALLERGEN-02" in ids


def test_policy_verdict_deny_on_gluten_sku():
    constraints = {"gluten_free": True, "budget": 2000}
    candidates = [{"sku": "SKU-104", "gluten_free": False}]
    verdict, cited = evaluate_policy_verdict(constraints, candidates)
    assert verdict == "deny"
    assert "POL-ALLERGEN-01" in cited


def test_catalog_dinner_within_budget():
    constraints = parse_constraints(USER_QUERY)
    candidates = search_dinner_candidates(constraints)
    assert len(candidates) >= 3
    assert sum(item["price"] for item in candidates) <= constraints["budget"]
    assert all(item["sku"] != "SKU-104" for item in candidates)


def test_promo_marks_tomato_sauce():
    candidates = [{"sku": "SKU-102", "title": "Соус томатный классический", "price": 129}]
    chunks = [item for item in POLICY_KB if item["policy_id"] == "POL-PROMO-01"]
    updated, notes = apply_promos(candidates, chunks)
    assert updated[0].get("promo") == "2+1"
    assert notes


def test_graph_happy_path():
    result = run_query(USER_QUERY)
    assert result["policy_verdict"] == "allow"
    assert result["final_answer"]
    assert "SKU-104" not in result["final_answer"]
    assert len(result["cart"]) >= 3


def test_graph_compiles():
    graph = build_app().get_graph()
    node_names = set(graph.nodes.keys())
    expected = {
        "orchestrator",
        "intent_parser",
        "policy_analyst",
        "catalog_searcher",
        "promo_analyst",
        "basket_assembler",
        "synthesize",
        "__start__",
        "__end__",
    }
    assert expected.issubset(node_names)
