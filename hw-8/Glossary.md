# hw-8 Glossary

Terms for **IaC, CI/CD, MLOps and Canary** for delivering the RetailPartnerX AI Service.  
Data Lake / embeddings — [hw-5/Glossary.md](../hw-5/Glossary.md).  
Eval / observability — [hw-6/Glossary.md](../hw-6/Glossary.md).

Document: [delivery-pipeline.md](docs/delivery-pipeline.md).

---

## Infrastructure and Code Delivery

### IaC (Infrastructure as Code)

Describing infrastructure in code (here, **Terraform**): VPC, Kubernetes, S3, registry.  
A platform change = merge + `plan`/`apply`, not manual clicks in a console.

### Terraform

An IaC tool: declarative resources and modules. In hw-8 it is pseudocode for the base platform; applications are deployed via GitOps, not through endless `terraform apply` runs for services.

### CI (Continuous Integration)

Automatic build and checks on every commit/PR: Docker build, unit tests, contract checks.

### CD (Continuous Delivery / Deployment)

Automatic (or nearly automatic) delivery to staging/prod after green checks. In this case CD = **GitOps** + Canary.

### GitOps

The desired state of the cluster is stored in Git; a controller (Argo CD) brings the live state in line with the manifests. CI pushes the image and updates values — it does not run a manual `kubectl apply` in prod.

### Argo CD

A Kubernetes GitOps operator: **API Server**, **Repository Server**, **Application Controller** ([architecture overview](https://argo-cd.readthedocs.io/en/stable/operator-manual/architecture/)). It watches for OutOfSync and synchronizes the RetailPartnerX applications.

### Argo Rollouts

An extension for progressive delivery: Canary / Blue-Green with traffic weights and automatic rollback based on metrics.

---

## MLOps

### MLOps

Practices for automating the ML lifecycle: data → training → registry → deployment → monitoring. In RetailPartnerX it connects to the application CI/CD.

### Airflow (Apache Airflow)

A DAG orchestrator: on a "curated dataset updated" event it starts retrain / re-embed and model registration.

### Model Registry (e.g. MLflow)

A catalog of model versions with metadata, metrics and a stage (`Staging` / `Production`). The source of truth for `MODEL_URI` in the AI Service.

### model_uri

A pointer to the model artifact (a path in Registry/S3) that the runtime loads at startup or on hot reload. It links the **code** (image) and the **weights** (artifact).

### index_version

The Vector DB index version (Product KB). It allows rolling back the RAG index independently of the service image (hw-5).

### Retrain

Retraining the Ranker (and, if needed, recomputing catalog embeddings) on fresh Lake / Feature Store data.

---

## Release

### Canary Release

Gradually rolling out a new version to a small share of users (1% → 5% → … → 100%) with the ability to quickly return traffic to the old version ([Fowler](https://martinfowler.com/bliki/CanaryRelease.html)).

### Blue-Green Deployment

Two full environments (blue/green); 100% of traffic switches at once. A faster cutover but a higher risk for an AI model — a fallback option in hw-8.

### Rollback

Returning to the previous stable version (traffic / GitOps pointer / index alias) when metric thresholds are breached.

### Eval gate

A quality threshold (Faithfulness, Answer Relevancy, etc.) in CI/CD; without passing it, the Canary does not start in prod (hw-6).

---

## Quick Index

| Term | In one phrase |
| ------ | ------------ |
| IaC / Terraform | Infra in code: VPC, K8s, S3 |
| CI / CD | Build+tests / delivery to the cluster |
| GitOps / Argo CD | Git = desired state |
| Argo Rollouts | Canary by % of traffic |
| Airflow | Data-triggered retrain |
| Model Registry | Model versions + stage |
| model_uri / index_version | Binding app ↔ model ↔ Vector DB |
| Canary / Rollback | 1%→100% and metric-based rollback |
| Eval gate | AI quality as a release stop switch |
