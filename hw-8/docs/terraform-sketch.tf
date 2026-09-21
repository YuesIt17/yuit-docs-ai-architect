# Terraform sketch — RetailPartnerX platform (учебный псевдокод)
# Не для реального apply: иллюстрация ресурсов из hw-8 §1.
# Провайдер условный (yandex / aws) — в кейсе достаточно структуры модулей.

terraform {
  required_version = ">= 1.5.0"
}

# --- Network ---
module "vpc" {
  source = "./modules/vpc"
  name   = "retailpartnerx-prod"
  cidr   = "10.20.0.0/16"
  # public + private subnets, NAT, routes
}

# --- Kubernetes ---
module "k8s" {
  source     = "./modules/managed_kubernetes"
  name       = "rpx-ai"
  vpc_id     = module.vpc.id
  subnet_ids = module.vpc.private_subnet_ids

  node_groups = {
    general = { cores = 4, memory_gb = 16, count = 3 }
    # roadmap hw-7: GPU pool for self-hosted LLM / heavy train
    # gpu = { gpu = "a100", count = 2 }
  }
}

# --- Object storage (Data Lake + models + CI artifacts) ---
resource "s3_bucket" "lake_raw" {
  name = "rpx-lake-raw"
}

resource "s3_bucket" "lake_curated" {
  name = "rpx-lake-curated"
}

resource "s3_bucket" "models" {
  name = "rpx-model-registry-artifacts"
  # MLflow artifact store root
}

resource "s3_bucket" "ci_artifacts" {
  name = "rpx-ci-artifacts"
  # build cache, eval reports, SBOM
}

# --- Container images ---
resource "container_registry" "rpx" {
  name = "rpx-images"
  # ai-service, ranker-train, embed-job
}

# --- IAM (least privilege sketches) ---
resource "service_account" "ci" {
  name = "rpx-ci"
  # push to registry, write ci_artifacts, plan terraform
}

resource "service_account" "airflow" {
  name = "rpx-airflow"
  # read lake_*, write models, trigger registry API
}

resource "service_account" "argo" {
  name = "rpx-argo"
  # deploy into k8s namespaces staging/prod
}

# --- Secrets (refs only; values not in TF state ideally via external SM) ---
resource "secret_manager_secret" "llm_api_key" {
  name = "rpx-llm-api-key"
}

# --- GitOps / delivery add-ons (helm releases via TF or bootstrap once) ---
# module "argocd" { ... }
# module "argo_rollouts" { ... }
# module "airflow" { ... }
# module "mlflow" { artifact_root = s3_bucket.models.url }

output "kubeconfig_hint" {
  value = "use cloud CLI to fetch kubeconfig for module.k8s.cluster_id"
}

output "model_bucket" {
  value = s3_bucket.models.name
}
