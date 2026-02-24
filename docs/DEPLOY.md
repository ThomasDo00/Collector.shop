# Guide de Déploiement - Collector.shop

## Infrastructure de production

| Élément | Valeur |
|---------|--------|
| Domaine | `https://collector-shop.online` |
| Orchestration | Kubernetes (K3s) |
| Registry | GitHub Container Registry (GHCR) |
| Images | `ghcr.io/thomasdo00/collector-frontend` / `collector-backend` |
| Namespace K8s | `collector-prod` |
| CI/CD | GitHub Actions (`deploy.yml`) |

---

## Déploiement automatique

Chaque push sur la branche `main` déclenche automatiquement le pipeline :

```
Push main
  → Build images Docker → GHCR
  → Trivy security scan
  → kubectl set image (K3s)
  → Rollout wait (5 min timeout)
  → Migrations DB
  → OWASP ZAP scan
  → (Rollback automatique si échec)
```

Aucune action manuelle requise. Suivre l'avancement sur GitHub → **Actions** → **Deploy**.

---

## Déploiement manuel

Depuis GitHub : **Actions → Deploy → Run workflow → production**

Utile pour :
- Re-déployer sans code change
- Forcer un déploiement après correction d'un secret

---

## Secrets GitHub requis

Configurer dans : `Settings → Secrets and variables → Actions`

| Secret | Description |
|--------|-------------|
| `KUBE_CONFIG` | Contenu du fichier kubeconfig encodé en base64 |

```bash
# Générer la valeur du secret KUBE_CONFIG
cat ~/.kube/config | base64 -w 0
```

---

## Structure Kubernetes

Le namespace `collector-prod` doit contenir :

```
Deployments:
  - backend    (image: ghcr.io/thomasdo00/collector-backend)
  - frontend   (image: ghcr.io/thomasdo00/collector-frontend)

Services:
  - backend-svc    (ClusterIP, port 3000)
  - frontend-svc   (ClusterIP, port 80)

Ingress:
  - collector-ingress
      collector-shop.online/      → frontend-svc
      collector-shop.online/api/  → backend-svc

Secrets:
  - collector-secrets  (variables d'environnement du backend)

PersistentVolumeClaims:
  - postgres-pvc
  - redis-pvc
  - minio-pvc
```

---

## Variables d'environnement de production

Les variables sensibles doivent être stockées dans un Secret Kubernetes `collector-secrets` :

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: collector-secrets
  namespace: collector-prod
type: Opaque
stringData:
  DATABASE_URL: "postgresql://user:password@postgres-svc:5432/collector"
  REDIS_URL: "redis://redis-svc:6379"
  JWT_SECRET: "<min 32 caractères>"
  REFRESH_TOKEN_SECRET: "<min 32 caractères>"
  STRIPE_SECRET_KEY: "sk_live_..."
  STRIPE_WEBHOOK_SECRET: "whsec_..."
  S3_ENDPOINT: "http://minio-svc:9000"
  S3_ACCESS_KEY: "<access key>"
  S3_SECRET_KEY: "<secret key>"
  S3_BUCKET_NAME: "collector-images"
  FRONTEND_URL: "https://collector-shop.online"
```

---

## Commandes utiles

### Vérifier l'état du déploiement

```bash
# État des pods
kubectl get pods -n collector-prod

# Logs du backend
kubectl logs -n collector-prod deployment/backend --tail=100

# Logs du frontend
kubectl logs -n collector-prod deployment/frontend --tail=100

# Événements récents
kubectl get events -n collector-prod --sort-by='.lastTimestamp'
```

### Rollback manuel

```bash
# Revenir à la version précédente
kubectl rollout undo deployment/backend -n collector-prod
kubectl rollout undo deployment/frontend -n collector-prod

# Vérifier l'historique des déploiements
kubectl rollout history deployment/backend -n collector-prod
```

### Migrations de base de données

```bash
# Lancer les migrations manuellement
kubectl exec -n collector-prod deployment/backend -- \
  npx tsx node_modules/knex/bin/cli.js migrate:latest \
  --knexfile src/core/database/knexfile.ts

# Vérifier le statut des migrations
kubectl exec -n collector-prod deployment/backend -- \
  npx tsx node_modules/knex/bin/cli.js migrate:status \
  --knexfile src/core/database/knexfile.ts
```

### Redémarrer un déploiement

```bash
# Redémarrage rolling (sans downtime)
kubectl rollout restart deployment/backend -n collector-prod
kubectl rollout restart deployment/frontend -n collector-prod
```

---

## Développement local vs Production

| Aspect | Local | Production |
|--------|-------|------------|
| Services | Docker Compose (`docker-compose.yml`) | Kubernetes (`collector-prod`) |
| Images | Build local | GHCR (`ghcr.io/thomasdo00/collector`) |
| Config | `.env` | Secret K8s `collector-secrets` |
| Base de données | `localhost:5432` | `postgres-svc:5432` (in-cluster) |
| Redis | `localhost:6379` | `redis-svc:6379` (in-cluster) |
| MinIO | `localhost:9000` | `minio-svc:9000` (in-cluster) |
| Frontend URL | `http://localhost:5173` | `https://collector-shop.online` |
| Backend URL | `http://localhost:3000` | `https://collector-shop.online/api` |

---

## Troubleshooting

### Les pods crashent au démarrage

```bash
# Voir les logs du pod (y compris les crashes précédents)
kubectl logs -n collector-prod deployment/backend --previous

# Vérifier les ressources
kubectl describe pod -n collector-prod -l app=backend
```

### Erreur de connexion à la base de données

```bash
# Vérifier que le secret est bien monté
kubectl exec -n collector-prod deployment/backend -- env | grep DATABASE_URL

# Tester la connexion depuis le pod
kubectl exec -n collector-prod deployment/backend -- \
  npx tsx -e "import knex from 'knex'; const db = knex({ client: 'pg', connection: process.env.DATABASE_URL }); db.raw('SELECT 1').then(() => { console.log('OK'); process.exit(0); }).catch(e => { console.error(e.message); process.exit(1); });"
```

### L'ingress ne répond pas

```bash
# Vérifier l'ingress
kubectl describe ingress collector-ingress -n collector-prod

# Vérifier les services
kubectl get svc -n collector-prod
```
