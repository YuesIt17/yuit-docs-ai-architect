from __future__ import annotations

import pandas as pd

USER_QUERY = (
    "Build a dinner for 4 people: pasta, gluten-free, budget up to 2000 rubles"
)

CATALOG = pd.DataFrame(
    [
        {
            "sku": "SKU-101",
            "title": "Gluten-free rice pasta",
            "category": "pasta",
            "price": 189,
            "gluten_free": True,
        },
        {
            "sku": "SKU-102",
            "title": "Classic tomato sauce",
            "category": "sauces",
            "price": 129,
            "gluten_free": True,
        },
        {
            "sku": "SKU-103",
            "title": "Grated Parmesan",
            "category": "cheeses",
            "price": 249,
            "gluten_free": True,
        },
        {
            "sku": "SKU-104",
            "title": "Wheat spaghetti pasta",
            "category": "pasta",
            "price": 99,
            "gluten_free": False,
        },
        {
            "sku": "SKU-105",
            "title": "Extra Virgin olive oil",
            "category": "oils",
            "price": 399,
            "gluten_free": True,
        },
        {
            "sku": "SKU-106",
            "title": "Arugula salad",
            "category": "vegetables",
            "price": 159,
            "gluten_free": True,
        },
        {
            "sku": "SKU-107",
            "title": "Wheat croutons",
            "category": "ready-made",
            "price": 89,
            "gluten_free": False,
        },
        {
            "sku": "SKU-108",
            "title": "Pesto sauce",
            "category": "sauces",
            "price": 219,
            "gluten_free": True,
        },
    ]
)

POLICY_KB = [
    {
        "policy_id": "POL-ALLERGEN-01",
        "text": "Products containing gluten are prohibited when a gluten-free diet is requested.",
    },
    {
        "policy_id": "POL-ALLERGEN-02",
        "text": "Wheat pasta contains gluten and is not suitable for a gluten-free diet.",
    },
    {
        "policy_id": "POL-PROMO-01",
        "text": "2+1 promotion on tomato sauces up to the end of the month.",
    },
    {
        "policy_id": "POL-GDPR-01",
        "text": "Personalized recommendations require user consent for data processing.",
    },
]

DINNER_CATEGORIES = ("pasta", "sauces", "cheeses", "vegetables")
