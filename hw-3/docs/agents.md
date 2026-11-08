# Step 1: Choosing Patterns and Agents

Case: [RetailPartnerX AI Strategy](../../hw-1/RetailPartnerX_AI_Strategy.md) · architecture: [hw-2](../../hw-2/diagrams/README.md)

## Pattern

**Supervisor / hierarchical multi-agent** — the Orchestrator (Manager) coordinates specialized agents. Each agent is a separate LangGraph node with a clear area of responsibility.

## Mapping to the Assignment Template (Business Travel → Retail)

| Assignment template | RetailPartnerX agent | Task |
|-----------|---------------------|--------|
| Manager | **Orchestrator** | Plan, delegation, final reply in the chat |
| Ticket searcher | **Catalog Searcher** | Semantic SKU search in the catalog |
| Budget analyst | **Promo & Budget Analyst** | Promotions, fitting the budget |
| Hotel booker | **Basket Assembler** | Cart assembly, substitutions on OOS |
| — (new) | **Intent & Constraint Parser** | Entity extraction from the request |
| Travel policy (RAG) | **Policy Analyst** | RAG over the Policy KB: allergens, 18+, GDPR |

## Agent Decomposition (SRP)

| Agent | Responsibility (one area) | Tools / data | Does not do |
|-------|----------------------------|----------------------|-----------|
| **Orchestrator** | Step routing, synthesizing the reply to the user | LLM, LangGraph state | SKU search, policy checks |
| **Intent & Constraint Parser** | NER: dish, persons, diets, budget, allergens | LLM structured output | Product search |
| **Catalog Searcher** | Semantic SKU search and filtering | Vector DB (`products`), SQL DB (price, availability) | Compliance checks |
| **Policy Analyst** | Validating constraints against company policies | **RAG** → Policy KB (`policies` collection) | Selecting promotions |
| **Promo & Budget Analyst** | Optimizing the set for budget and promotions | SQL DB (prices, promotions), RAG fragments | Building the cart |
| **Basket Assembler** | Final cart, substitutes | `POST /get_recommendation` (hw-2 API) as a tool | Intent parsing |

## Why Not One Monolithic Agent

1. **Different data sources** — the catalog (vector + SQL) and policies (RAG) need different retrieval strategies; mixing them in one prompt hurts accuracy and audit.
2. **Compliance (hw-1, R4/R8)** — the Policy Analyst is isolated: it can be tested and logged separately; the Orchestrator does not publish a reply without `policy_status=ok`.
3. **Reuse of hw-2** — the Basket Assembler calls the existing recsys API without duplicating the Ranker/RAG Manager.

## Guardrails (Risks from hw-1)

| Risk | Agent mitigation |
|------|-------------------|
| **R4** — toxic/prohibited recommendations | Policy Analyst: blocklists in the Policy KB, refusing the recommendation |
| **R6** — GDPR / consent | Policy Analyst: checking `personalization_consent` before personal selections |
| **R8** — genAI hallucinations | Replies based only on retrieval chunks + citations; fallback on a low score |

## Delegation Flow (Simplified)

```
User message
  → Orchestrator
    → Intent Parser (constraints)
    → parallel: Catalog Searcher | Policy Analyst
    → Promo & Budget Analyst
    → Basket Assembler
  → Orchestrator (synthesize)
  → User response
```

Parallel Catalog|Policy is the target deployment model; the prototype in [`code/`](../code/) follows the sequence happy path (stub without API keys).
