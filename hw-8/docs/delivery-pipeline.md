# Delivery Pipeline — RetailPartnerX

**Project:** personalized recommendations + shopping assistant  
**Stage:** MVP → Prod (educational architecture design)  
**Diagram:** [diagrams/cicd-mlops-pipeline.drawio](../diagrams/cicd-mlops-pipeline.drawio) · [PNG](../diagrams/cicd-mlops-pipeline.png)  
**IaC sketch:** [terraform-sketch.tf](terraform-sketch.tf)

Link to previous assignments: Prod roadmap ([hw-1](../../hw-1/RetailPartnerX_AI_Strategy.md)); AI Service / OpenAPI ([hw-2](../../hw-2/diagrams/README.md)); agents + dual KB ([hw-3](../../hw-3/docs/rag-pipeline.md)); data lake / embeddings ([hw-5](../../hw-5/docs/data-pipeline.md)); eval gates + observability ([hw-6](../../hw-6/docs/quality-assurance.md)); GPU node sizing ([hw-7](../../hw-7/docs/recommendation.md)).

> This is an **educational** delivery design, not a production deployment. The goal is to connect code, model and infrastructure into one automated loop.

---

## 1. Infrastructure as Code (Terraform)

We automatically provision the **base platform** that runs the CI/CD runner artifacts, AI Service, data plane and training jobs.

### Resources (What Terraform Creates)

| Resource | Purpose for RetailPartnerX |
| ------ | ----------------------------- |
| **VPC** + subnets (public/private) | Isolation of the control plane, worker nodes, data jobs |
| **Managed Kubernetes** (Yandex MK8s / EKS equivalent) | AI Service, Argo CD, Airflow workers, Ranker / agents |
| **GPU node group** (optional, hw-7 roadmap) | Self-hosted LLM / heavy retrain |
| **S3 buckets** | `raw` / `curated` Data Lake (hw-5); `models` (Registry artifacts); `artifacts` (CI build cache, eval reports) |
| **Container Registry** | Docker images `ai-service`, `ranker-train`, `embed-job` |
| **IAM / service accounts** | Least privilege: CI → push image; Airflow → S3 + Registry; Argo → deploy |
| **Secret Manager** | LLM keys, registry tokens (continues hw-6) |
| **Observability basics** | Namespace + ServiceMonitor hooks for Prometheus/Grafana (hw-6) |

Module pseudocode is in [terraform-sketch.tf](terraform-sketch.tf).

### Principle

```text
terraform apply  →  VPC + K8s + S3 + Registry
git push (infra) →  plan/apply in CI (main only, with review)
app/model CD     →  not via terraform apply of services, but via GitOps (Argo CD)
```

Infrastructure (cluster, buckets) is **Terraform**. Applications and model versions are **GitOps manifests** (Helm/Kustomize), so Canary and rollback do not require another `terraform apply`.

---

## 2. CI/CD Pipeline

The delivery chain for the **AI Service code** (Ranker API + shopping assistant):

```text
Commit → Build Docker → Unit Tests → Deploy Staging → E2E / Eval Gates → Deploy Prod (Canary)
```

| Stage | What happens | Automatic? |
| ---- | -------------- | ----- |
| **Commit** | Push to `main` / PR; webhook → CI | yes |
| **Build Docker** | Multi-stage image; `git-sha` tag + digest | yes |
| **Unit Tests** | pytest (as in hw-3), lint, OpenAPI contract check | yes |
| **Deploy Staging** | Argo CD sync to the `staging` namespace | yes |
| **E2E / Eval** | Smoke API + DeepEval/Ragas smoke (Faithfulness / Relevancy, hw-6) | yes |
| **Deploy Prod** | GitOps: new image tag + `model_uri` in values → Argo Rollouts Canary | yes\* |

\* An optional **manual approval** only for the first prod launch / a major model bump; everyday releases have no manual step.

### GitOps (Argo CD)

Per the [Argo CD Architecture](https://argo-cd.readthedocs.io/en/stable/operator-manual/architecture/):

| Component | Role at RetailPartnerX |
| --------- | --------------------- |
| **API Server** | UI/CLI, sync, webhook from Git | 
| **Repository Server** | Cache of Git manifests (Helm values: image, `model_uri`, `index_version`) |
| **Application Controller** | Compares desired (Git) vs live (K8s); OutOfSync → sync / Canary step |

CI does **not** run `kubectl apply` in prod: CI pushes the image and commits/opens a PR in the manifest repo; the Controller brings the cluster to the desired state.

---

## 3. MLOps Integration

Linking **data → training → model registry → delivery** for the Ranker and Vector DB updates (RAG Product KB).

```text
Dataset / catalog updated (S3 curated)
  → Airflow DAG trigger
  → Retrain Ranker (+ optional re-embed catalog)
  → Register in Model Registry (MLflow)
  → Publish index_version to Vector DB
  → Trigger CD (bump model_uri / index_version in GitOps)
  → Staging → Eval → Canary Prod
```

### Linking Application Code and the Model Artifact

| Artifact | Where it is stored | How it reaches the runtime |
| -------- | ------------ | ---------------------- |
| **App image** | Container Registry | Deployment `image: ai-service@sha256:…` |
| **Ranker model** | Model Registry → S3 `models/` | Env/ConfigMap: `MODEL_URI=models:/ranker/3` |
| **Product KB index** | Vector DB + metadata | `INDEX_VERSION=2026-09-21.v12` (hw-5 versioning) |
| **LLM** | SaaS / self-host (ADR-001) | via the LLM Client; the provider version is not in the same image |

At startup / hot reload, the AI Service reads **only a registered** model version (`Production` stage in MLflow). The application image and the model are **versioned separately**, but a prod release always specifies an **explicit pair** `(image_digest, model_uri, index_version)` in the GitOps values — this satisfies the **Integration** criterion.

### RAG / Vector DB auto-update

1. The Airflow task `embed_catalog` reads the curated PIM layer from S3 (hw-5).  
2. It writes a new index / alias to the Vector DB.  
3. After a green eval on staging, Argo switches the `product-kb-prod` alias → the new `index_version`.  
4. An index rollback = switching the alias back (no Ranker downtime).

### Manual Actions (Minimum)

| Action | When |
| -------- | ----- |
| Merging the manifest PR | Only if branch protection (policy) is enabled, not a "deploy button" |
| Approving a major model | Optional for `stage: Production` on a jump in offline metrics |
| Incident rollback | Usually **automatic** by metrics; manual is an override in Argo Rollouts |

The everyday path "new dataset → new model in canary" has **no** manual SSH/kubectl.

---

## 4. Release Strategy — Canary

The strategy follows the idea of [Canary Release](https://martinfowler.com/bliki/CanaryRelease.html): the new version first goes to a small % of users, then expands; if problems appear, traffic returns to stable.

### Traffic Switching

Tool: **Argo Rollouts** (or Istio/Envoy weight) in front of the AI Service Service.

| Step | Share of traffic on canary | Transition condition |
| --- | ---------------------- | ---------------- |
| 0 | 0% (pod ready + smoke only) | Readiness + synthetic check |
| 1 | **1%** | 15–30 min, metrics normal |
| 2 | **5%** | another 30–60 min |
| 3 | **25%** (optional) | business KPI without regression |
| 4 | **100%** | promote; old ReplicaSet scale-down |

For RetailPartnerX, the canary is split at the **Backend → AI Service** level (header/`user_id` hash or a random %), so the product page and chat see one version within a session.

### Rollback Metrics

Automatic rollback (traffic → 0% canary, scale down the new RS) if, during the observation window:

| Class | Metric | Threshold (MVP reference) | Source |
| ----- | ------- | -------------------- | -------- |
| **Reliability** | HTTP 5xx rate | > 2× baseline staging/prod | Prometheus |
| **Latency** | p95 `POST /get_recommendation` | > SLO budget / > +30% vs baseline | Prometheus (hw-2 NFR) |
| **Saturation** | GPU/CPU queue depth | sustained growth + timeouts | hw-6 / hw-7 |
| **AI quality** | Faithfulness / Answer Relevancy (online sample or shadow) | below the CI threshold (e.g. Faithfulness &lt; 0.85) | Langfuse + eval job (hw-6) |
| **Business** | CTR of the "Frequently bought together" block / add-to-cart rate | statistically significant drop vs control | CDP / Grafana |

On rollback, the **model** and **index alias** stay on the previous `Production` versions in the Registry (we do not delete the artifact — we only remove traffic and roll back the GitOps pointer).

### Why Not Only Blue-Green

Blue-Green gives a fast cutover but puts 100% of the risk on the new model/RAG index at once. For an AI service with hallucination and drift risks (**R8**, hw-1/hw-6), Canary is preferable; Blue-Green remains a fallback for purely infrastructure releases without a model change.

---

## 5. Automation Summary

| Loop | Trigger | Result | Manual |
| ------ | ------- | --------- | ------ |
| Infra | Merge Terraform | VPC, K8s, S3 | Review plan |
| App CI/CD | Commit app | Image → staging → canary prod | Optional approve |
| MLOps | New curated dataset | Retrain → Registry → Vector DB → CD | Optional model stage |
| Rollback | Metric breach | Traffic 100% → stable | Override only |

**Bottom line:** code and model are linked through the Model Registry + GitOps values; release safety comes from tests + Canary; automation comes from Airflow + CI + Argo CD/Rollouts.

> **Abbreviations:** [Glossary](../Glossary.md)
