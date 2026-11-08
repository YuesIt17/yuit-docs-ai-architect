# Assignment

**Multi-level design: from the C4 Model to the API specification**

> **Abbreviations:** [Glossary](Glossary.md) · **Artifacts:** [diagrams/](diagrams/) · [openapi/recommendation-api.yaml](openapi/recommendation-api.yaml)

## Goal

Design a multi-level architecture of an AI service using C4 diagrams and an API specification to align on the integration.

## Description / Step-by-Step Instructions

### Context

We continue working on the project from the first assignment (or choose your own case).

### Steps

1. **C2 Container Diagram** — draw the container diagram of the whole system. Identify the Frontend, Backend, AI Service, Vector DB and SQL DB.
2. **C3 Component Diagram** — "drill down" into the AI Service container. Show its internal components (for example, Controller, RAG Manager, LLM Client, Prompt Template Factory).
3. **Sequence Diagram** — draw the sequence diagram for the "User requests a recommendation" scenario.
4. **API Spec** — write the API specification (in YAML / Swagger format) for the interaction between the Backend and AI Service (the `/get_recommendation` endpoint).

## Useful Materials

| Tool / method | Description |
|--------------------------|----------|
| **C4 Model** | A multi-level design method |
| **OpenAPI (Swagger)** | An API specification editor |
| **Petstore API** | An example specification |

## Submission Format

- a link to the diagrams (Draw.io / Structurizr / Holst);
- a file or Gist link with the OpenAPI specification (YAML / JSON).

When submitting a link, make sure access to it is open.

If you have questions, you can ask them in the assignment review chat or in the VK group.

## Evaluation Criteria

Status **"Accepted"** if:

| Criterion | Description |
|----------|----------|
| **Notation compliance** | The diagrams are readable and the links point the right way |
| **Consistency** | The components on C3 match the steps on the Sequence diagram |
| **API quality** | The specification contains data types, request / response examples and error codes |

## Competencies

Develop, document and verify the architecture of AI solutions at different levels of detail, using professional tools and standards:

- create context and container diagrams (C1 and C2) for AI solutions using Draw.io or Structurizr;
- develop an LLD for individual containers, including C3 diagrams and OpenAPI specifications.

## Solution Artifacts (RetailPartnerX)

| Artifact | Path |
|----------|------|
| Draw.io diagrams | [diagrams/](diagrams/) — C1, C2, C3, Sequence |
| OpenAPI | [openapi/recommendation-api.yaml](openapi/recommendation-api.yaml) |
| hw-1 case | [RetailPartnerX_AI_Strategy.md](../hw-1/RetailPartnerX_AI_Strategy.md) |
| Composition and consistency | [diagrams/README.md](diagrams/README.md) |

Supporting specs and templates — [diagrams/_dev/](diagrams/_dev/) (not for submission).
