# Delivery Pipeline — RetailPartnerX

**Проект:** персонализированные рекомендации + шопинг-ассистент  
**Этап:** MVP → Prod (учебный architecture design)  
**Схема:** [diagrams/cicd-mlops-pipeline.drawio](../diagrams/cicd-mlops-pipeline.drawio) · [PNG](../diagrams/cicd-mlops-pipeline.png)  
**IaC sketch:** [terraform-sketch.tf](terraform-sketch.tf)

Связь с предыдущими ДЗ: roadmap Prod ([hw-1](../../hw-1/RetailPartnerX_AI_Strategy.md)); AI Service / OpenAPI ([hw-2](../../hw-2/diagrams/README.md)); agents + dual KB ([hw-3](../../hw-3/docs/rag-pipeline.md)); data lake / embeddings ([hw-5](../../hw-5/docs/data-pipeline.md)); eval gates + observability ([hw-6](../../hw-6/docs/quality-assurance.md)); GPU node sizing ([hw-7](../../hw-7/docs/recommendation.md)).

> Это **учебный** дизайн поставки, не production deployment. Цель — связать код, модель и инфраструктуру в один автоматизированный контур.

---

## 1. Infrastructure as Code (Terraform)

Автоматически поднимаем **базовую платформу**, на которой крутятся CI/CD runners-артефакты, AI Service, data plane и training jobs.

### Ресурсы (что создаёт Terraform)

| Ресурс | Назначение для RetailPartnerX |
| ------ | ----------------------------- |
| **VPC** + subnets (public/private) | Изоляция control-plane, worker nodes, data jobs |
| **Managed Kubernetes** (Yandex MK8s / EKS-аналог) | AI Service, Argo CD, Airflow workers, Ranker / agents |
| **GPU node group** (опц., roadmap hw-7) | Self-hosted LLM / тяжёлый retrain |
| **S3 buckets** | `raw` / `curated` Data Lake (hw-5); `models` (артефакты Registry); `artifacts` (CI build cache, eval reports) |
| **Container Registry** | Docker-образы `ai-service`, `ranker-train`, `embed-job` |
| **IAM / service accounts** | Least privilege: CI → push image; Airflow → S3 + Registry; Argo → deploy |
| **Secret Manager** | LLM keys, registry tokens (продолжает hw-6) |
| **Observability basics** | Namespace + ServiceMonitor hooks под Prometheus/Grafana (hw-6) |

Псевдокод модулей — в [terraform-sketch.tf](terraform-sketch.tf).

### Принцип

```text
terraform apply  →  VPC + K8s + S3 + Registry
git push (infra) →  plan/apply в CI (только main, с review)
app/model CD     →  не через terraform apply сервисов, а через GitOps (Argo CD)
```

Инфраструктура (cluster, buckets) — **Terraform**. Приложения и версии моделей — **GitOps manifests** (Helm/Kustomize), чтобы Canary и rollback не требовали повторного `terraform apply`.

---

## 2. CI/CD Pipeline

Цепочка поставки **кода AI Service** (Ranker API + shopping assistant):

```text
Commit → Build Docker → Unit Tests → Deploy Staging → E2E / Eval Gates → Deploy Prod (Canary)
```

| Этап | Что происходит | Авто? |
| ---- | -------------- | ----- |
| **Commit** | Push в `main` / PR; webhook → CI | да |
| **Build Docker** | Multi-stage image; тег `git-sha` + digest | да |
| **Unit Tests** | pytest (как hw-3), lint, OpenAPI contract check | да |
| **Deploy Staging** | Argo CD sync в namespace `staging` | да |
| **E2E / Eval** | Smoke API + DeepEval/Ragas smoke (Faithfulness / Relevancy, hw-6) | да |
| **Deploy Prod** | GitOps: новый image tag + `model_uri` в values → Argo Rollouts Canary | да\* |

\* Опциональный **manual approval** только на первый выход в prod / major model bump; повседневные релизы — без ручного шага.

### GitOps (Argo CD)

По [Argo CD Architecture](https://argo-cd.readthedocs.io/en/stable/operator-manual/architecture/):

| Компонент | Роль в RetailPartnerX |
| --------- | --------------------- |
| **API Server** | UI/CLI, sync, webhook от Git | 
| **Repository Server** | Кэш Git-манифестов (Helm values: image, `model_uri`, `index_version`) |
| **Application Controller** | Сравнивает desired (Git) vs live (K8s); OutOfSync → sync / Canary step |

CI **не** делает `kubectl apply` в prod: CI пушит образ и коммитит/PR в repo манифестов; Controller доводит кластер до desired state.

---

## 3. MLOps Integration

Связка **данных → обучение → реестр моделей → поставка** для Ranker и обновления Vector DB (RAG Product KB).

```text
Dataset / catalog updated (S3 curated)
  → Airflow DAG trigger
  → Retrain Ranker (+ optional re-embed catalog)
  → Register in Model Registry (MLflow)
  → Publish index_version to Vector DB
  → Trigger CD (bump model_uri / index_version in GitOps)
  → Staging → Eval → Canary Prod
```

### Связь кода приложения и артефакта модели

| Артефакт | Где хранится | Как попадает в runtime |
| -------- | ------------ | ---------------------- |
| **App image** | Container Registry | Deployment `image: ai-service@sha256:…` |
| **Ranker model** | Model Registry → S3 `models/` | Env/ConfigMap: `MODEL_URI=models:/ranker/3` |
| **Product KB index** | Vector DB + метаданные | `INDEX_VERSION=2026-09-21.v12` (hw-5 versioning) |
| **LLM** | SaaS / self-host (ADR-001) | через LLM Client; версия провайдера не в том же образе |

AI Service при старте / hot-reload читает **только зарегистрированную** версию модели (`Production` stage в MLflow). Образ приложения и модель **версионируются раздельно**, но релиз в prod всегда указывает **явную пару** `(image_digest, model_uri, index_version)` в GitOps values — это закрывает критерий **Интеграция**.

### RAG / Vector DB auto-update

1. Airflow task `embed_catalog` читает curated PIM-слой из S3 (hw-5).  
2. Пишет новый индекс / alias в Vector DB.  
3. После green eval на staging Argo переключает alias `product-kb-prod` → новый `index_version`.  
4. Rollback индекса = переключение alias назад (без даунтайма Ranker).

### Ручные действия (минимум)

| Действие | Когда |
| -------- | ----- |
| Merge PR манифестов | Только если включён branch protection (policy), не «кнопка деплоя» |
| Approve major model | Опционально для `stage: Production` при скачке метрик offline |
| Incident rollback | Обычно **авто** по метрикам; ручной — override в Argo Rollouts |

Повседневный путь «новый датасет → новая модель в canary» — **без** ручного SSH/kubectl.

---

## 4. Release Strategy — Canary

Стратегия по идее [Canary Release](https://martinfowler.com/bliki/CanaryRelease.html): новая версия сначала на малый % пользователей, затем расширение; при проблемах — возврат трафика на stable.

### Переключение трафика

Инструмент: **Argo Rollouts** (или Istio/Envoy weight) перед AI Service Service.

| Шаг | Доля трафика на canary | Условие перехода |
| --- | ---------------------- | ---------------- |
| 0 | 0% (только pod ready + smoke) | Readiness + synthetic check |
| 1 | **1%** | 15–30 мин, метрики в норме |
| 2 | **5%** | ещё 30–60 мин |
| 3 | **25%** (опц.) | business KPI без регрессии |
| 4 | **100%** | promote; old ReplicaSet scale-down |

Для RetailPartnerX canary режется на уровне **Backend → AI Service** (header/`user_id` hash или случайный %), чтобы карточка товара и чат видели одну версию в рамках сессии.

### Метрики отката (rollback)

Автоматический rollback (traffic → 0% canary, scale down new RS), если за окно наблюдения:

| Класс | Метрика | Порог (ориентир MVP) | Источник |
| ----- | ------- | -------------------- | -------- |
| **Reliability** | HTTP 5xx rate | > 2× baseline staging/prod | Prometheus |
| **Latency** | p95 `POST /get_recommendation` | > SLO-бюджета / > +30% vs baseline | Prometheus (hw-2 NFR) |
| **Saturation** | GPU/CPU queue depth | устойчивый рост + таймауты | hw-6 / hw-7 |
| **AI quality** | Faithfulness / Answer Relevancy (online sample или shadow) | ниже CI-порога (напр. Faithfulness &lt; 0.85) | Langfuse + eval job (hw-6) |
| **Business** | CTR блока «С этим покупают» / add-to-cart rate | статистически значимое падение vs control | CDP / Grafana |

При откате **модель** и **index alias** остаются на предыдущих `Production` версиях в Registry (не удаляем артефакт — только снимаем traffic и откатываем GitOps pointer).

### Почему не только Blue-Green

Blue-Green даёт быстрый cutover, но сразу 100% риска на новой модели/RAG-индексе. Для AI-сервиса с риском галлюцинаций и drift (**R8**, hw-1/hw-6) Canary предпочтительнее; Blue-Green оставляем как запасной вариант для чисто инфраструктурных релизов без смены модели.

---

## 5. Сводка автоматизации

| Контур | Триггер | Результат | Ручное |
| ------ | ------- | --------- | ------ |
| Infra | Merge Terraform | VPC, K8s, S3 | Review plan |
| App CI/CD | Commit app | Image → staging → canary prod | Optional approve |
| MLOps | Новый curated dataset | Retrain → Registry → Vector DB → CD | Optional model stage |
| Rollback | Breach метрик | Traffic 100% → stable | Только override |

**Итог:** код и модель связаны через Model Registry + GitOps values; безопасность релиза — тесты + Canary; автоматизация — Airflow + CI + Argo CD/Rollouts.

> **Сокращения:** [Глоссарий](../Glossary.md)
