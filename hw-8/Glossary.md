# Глоссарий hw-8

Термины **IaC, CI/CD, MLOps и Canary** для поставки AI Service RetailPartnerX.  
Data Lake / embeddings — [hw-5/Glossary.md](../hw-5/Glossary.md).  
Eval / observability — [hw-6/Glossary.md](../hw-6/Glossary.md).

Документ: [delivery-pipeline.md](docs/delivery-pipeline.md).

---

## Инфраструктура и поставка кода

### IaC (Infrastructure as Code)

Описание инфраструктуры в коде (здесь — **Terraform**): VPC, Kubernetes, S3, registry.  
Изменение платформы = merge + `plan`/`apply`, а не ручные клики в консоли.

### Terraform

Инструмент IaC: декларативные ресурсы и модули. В hw-8 — псевдокод базовой платформы; деплой приложений — через GitOps, не через бесконечный `terraform apply` сервисов.

### CI (Continuous Integration)

Автосборка и проверки на каждый commit/PR: Docker build, unit-тесты, contract checks.

### CD (Continuous Delivery / Deployment)

Автоматическая (или почти автоматическая) доставка в staging/prod после зелёных проверок. В кейсе CD = **GitOps** + Canary.

### GitOps

Desired state кластера хранится в Git; контроллер (Argo CD) приводит live-состояние к манифестам. CI пушит образ и обновляет values — не делает ручной `kubectl apply` в prod.

### Argo CD

GitOps-оператор Kubernetes: **API Server**, **Repository Server**, **Application Controller** ([обзор архитектуры](https://argo-cd.readthedocs.io/en/stable/operator-manual/architecture/)). Следит за OutOfSync и синхронизирует приложения RetailPartnerX.

### Argo Rollouts

Расширение для progressive delivery: Canary / Blue-Green с весами трафика и автоматическим rollback по метрикам.

---

## MLOps

### MLOps

Практики автоматизации жизненного цикла ML: данные → обучение → реестр → деплой → мониторинг. В RetailPartnerX стыкуется с CI/CD приложения.

### Airflow (Apache Airflow)

Оркестратор DAG’ов: по событию «обновился curated dataset» запускает retrain / re-embed и регистрацию модели.

### Model Registry (напр. MLflow)

Каталог версий моделей с метаданными, метриками и stage (`Staging` / `Production`). Источник истины для `MODEL_URI` в AI Service.

### model_uri

Указатель на артефакт модели (путь в Registry/S3), который runtime загружает при старте или hot-reload. Связывает **код** (image) и **веса** (артефакт).

### index_version

Версия индекса Vector DB (Product KB). Позволяет откатить RAG-индекс независимо от образа сервиса (hw-5).

### Retrain

Повторное обучение Ranker (и при необходимости пересчёт эмбеддингов каталога) на свежих данных Lake / Feature Store.

---

## Релиз

### Canary Release

Постепенная выдача новой версии малой доле пользователей (1% → 5% → … → 100%) с возможностью быстро вернуть трафик на старую версию ([Fowler](https://martinfowler.com/bliki/CanaryRelease.html)).

### Blue-Green Deployment

Два полных окружения (blue/green); переключение 100% трафика сразу. Быстрее cutover, выше риск для AI-модели — в hw-8 запасной вариант.

### Rollback

Возврат на предыдущую stable-версию (трафик / GitOps pointer / alias индекса) при срабатывании порогов метрик.

### Eval gate

Порог качества (Faithfulness, Answer Relevancy и т.п.) в CI/CD, без прохождения которого Canary в prod не стартует (hw-6).

---

## Быстрый указатель

| Термин | Одной фразой |
| ------ | ------------ |
| IaC / Terraform | Инфра в коде: VPC, K8s, S3 |
| CI / CD | Сборка+тесты / доставка в кластер |
| GitOps / Argo CD | Git = desired state |
| Argo Rollouts | Canary по % трафика |
| Airflow | Триггер retrain по данным |
| Model Registry | Версии моделей + stage |
| model_uri / index_version | Связка app ↔ model ↔ Vector DB |
| Canary / Rollback | 1%→100% и откат по метрикам |
| Eval gate | AI-качество как стоп-кран релиза |
