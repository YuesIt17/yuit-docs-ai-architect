from __future__ import annotations

import pandas as pd

USER_QUERY = (
    "Собери ужин на 4 человека: паста, без глютена, бюджет до 2000 рублей"
)

CATALOG = pd.DataFrame(
    [
        {
            "sku": "SKU-101",
            "title": "Паста рисовая без глютена",
            "category": "паста",
            "price": 189,
            "gluten_free": True,
        },
        {
            "sku": "SKU-102",
            "title": "Соус томатный классический",
            "category": "соусы",
            "price": 129,
            "gluten_free": True,
        },
        {
            "sku": "SKU-103",
            "title": "Пармезан тёртый",
            "category": "сыры",
            "price": 249,
            "gluten_free": True,
        },
        {
            "sku": "SKU-104",
            "title": "Паста пшеничная спагетти",
            "category": "паста",
            "price": 99,
            "gluten_free": False,
        },
        {
            "sku": "SKU-105",
            "title": "Оливковое масло Extra Virgin",
            "category": "масла",
            "price": 399,
            "gluten_free": True,
        },
        {
            "sku": "SKU-106",
            "title": "Салат руккола",
            "category": "овощи",
            "price": 159,
            "gluten_free": True,
        },
        {
            "sku": "SKU-107",
            "title": "Крутоны пшеничные",
            "category": "готовые",
            "price": 89,
            "gluten_free": False,
        },
        {
            "sku": "SKU-108",
            "title": "Соус песто",
            "category": "соусы",
            "price": 219,
            "gluten_free": True,
        },
    ]
)

POLICY_KB = [
    {
        "policy_id": "POL-ALLERGEN-01",
        "text": "Товары с глютеном запрещены при запросе безглютенового рациона.",
    },
    {
        "policy_id": "POL-ALLERGEN-02",
        "text": "Паста из пшеницы содержит глютен и не подходит для диеты gluten-free.",
    },
    {
        "policy_id": "POL-PROMO-01",
        "text": "Акция 2+1 на соусы томатные до конца месяца.",
    },
    {
        "policy_id": "POL-GDPR-01",
        "text": "Персональные рекомендации требуют согласия пользователя на обработку данных.",
    },
]

DINNER_CATEGORIES = ("паста", "соусы", "сыры", "овощи")
