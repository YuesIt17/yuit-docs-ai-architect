# Assignment hw-8 — RetailPartnerX

**Delivery automation: IaC, CI/CD and MLOps pipelines**

> **Abbreviations:** [Glossary](Glossary.md) · **Artifacts:** [docs/](docs/) · [diagrams/](diagrams/)

## Goal

Design an automated delivery pipeline for the RetailPartnerX AI service, integrating model training and a Canary release.

## Context and Continuity

| Assignment | Artifact | Link to hw-8 |
| -- | -------- | ------------ |
| [hw-1](../hw-1/RetailPartnerX_AI_Strategy.md) | PoC→MVP→Prod roadmap | Prod = delivery automation + safe release |
| [hw-2](../hw-2/diagrams/README.md) | AI Service, OpenAPI | Deployment artifact: service Docker image + API contract |
| [hw-3](../hw-3/README.md) | Multi-agent RAG | Agent release + Product/Policy KB updates |
| [hw-4](../hw-4/docs/adr-001-llm-hosting.md) | LLM hosting ADR | The LLM Client does not change the deployment contract; secrets via Secret Manager |
| [hw-5](../hw-5/docs/data-pipeline.md) | Kafka → S3 → Feature Store / Vector DB | MLOps trigger: new curated dataset / catalog → retrain + re-embed |
| [hw-6](../hw-6/docs/quality-assurance.md) | Eval gates, observability | Unit/E2E + Ragas/DeepEval in CI; Canary rollback metrics |
| [hw-7](../hw-7/docs/recommendation.md) | GPU sizing | K8s node pools / GPU node group for a self-hosted LLM (roadmap) |

**Task:** for RetailPartnerX (recommendations + shopping assistant), describe **IaC → CI/CD → MLOps → Canary** so that the application code and the model version from the Model Registry reach prod with minimal manual steps.

The course topic is preserved; the pipelines are tied to the AI Service, Ranker, Vector DB and eval gates from earlier modules.

## Steps (Solution Artifacts)

| Assignment step | Document / file |
| ------ | --------------- |
| 1. Infrastructure as Code | [docs/delivery-pipeline.md](docs/delivery-pipeline.md) §1 · [docs/terraform-sketch.tf](docs/terraform-sketch.tf) |
| 2. CI/CD Pipeline | [diagrams/cicd-mlops-pipeline.png](diagrams/cicd-mlops-pipeline.png) · [docs/delivery-pipeline.md](docs/delivery-pipeline.md) §2 |
| 3. MLOps Integration | Diagram (lower loop) · [docs/delivery-pipeline.md](docs/delivery-pipeline.md) §3 |
| 4. Release Strategy (Canary) | [docs/delivery-pipeline.md](docs/delivery-pipeline.md) §4 |

## Submission Format

| Artifact | Path |
| -------- | ---- |
| CI/CD + MLOps diagram | [diagrams/cicd-mlops-pipeline.drawio](diagrams/cicd-mlops-pipeline.drawio) · [PNG](diagrams/cicd-mlops-pipeline.png) |
| Description of IaC / pipelines / Canary | [docs/delivery-pipeline.md](docs/delivery-pipeline.md) |
| Terraform pseudocode | [docs/terraform-sketch.tf](docs/terraform-sketch.tf) |

## Self-Check Criteria

| Criterion | How it is met |
| -------- | ----------- |
| Integration | App image + `model_uri` / `index_version` from the Model Registry — [§3](docs/delivery-pipeline.md), [diagram](diagrams/cicd-mlops-pipeline.png) |
| Release safety | Unit → Staging → E2E/Eval → Canary 1%→5%→100% + rollback metrics — [§2, §4](docs/delivery-pipeline.md) |
| Automation | Terraform + GitOps (Argo CD) + Airflow→Registry→CD; only an optional manual prod gate — [§1–3](docs/delivery-pipeline.md) |

Status "Accepted" if all three criteria are met.

## Useful Materials

| Material | Description |
| -------- | -------- |
| [Argo CD — Architectural Overview](https://argo-cd.readthedocs.io/en/stable/operator-manual/architecture/) | API Server, Repo Server, Application Controller |
| [Canary Release (Martin Fowler)](https://martinfowler.com/bliki/CanaryRelease.html) | Gradual rollout and traffic rollback |

## Competencies

Plan and organize reliable infrastructure for AI systems, including CI/CD and fault tolerance:

- write Terraform configurations for base infrastructure (VPC, Kubernetes, S3);
- design MLOps pipelines for RAG with automatic vector database updates;
- develop release plans for AI services with a Canary strategy.
