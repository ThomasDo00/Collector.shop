# Stack Technique — Collector.shop

Collector.shop est une marketplace C2C (particulier à particulier) de vente d'objets de collection (sneakers, figurines, posters signés, cassettes vintage…). Ce document décrit l'ensemble des outils et technologies utilisés, de l'application jusqu'à la production.

---

## 1. Application

### Frontend

| Outil | Version | Rôle |
|---|---|---|
| **React** | 18 | Framework UI — composants, état local, rendu |
| **TypeScript** | 5.4 | Typage statique sur tout le frontend |
| **Vite** | 5.4 | Bundler et serveur de développement (HMR ultra-rapide) |
| **Redux Toolkit** | 2.2 | Gestion d'état global (auth, panier, favoris) |
| **React Router** | 7.6 | Navigation SPA côté client |
| **React Hook Form** | 7.6 | Gestion des formulaires avec validation |
| **Zod** | 4 | Schémas de validation des données (partagé avec le backend) |
| **Axios** | 1.7 | Client HTTP pour les appels API |
| **Tailwind CSS** | 3.4 | Framework CSS utility-first |
| **clsx** | 2.1 | Construction conditionnelle de classes CSS |
| **Heroicons** | 2.2 | Librairie d'icônes SVG |
| **date-fns** | 4.1 | Manipulation et formatage des dates |
| **otplib** | 13.3 | Génération et vérification de codes TOTP (2FA) |

### Backend

| Outil | Version | Rôle |
|---|---|---|
| **Fastify** | 4.26 | Framework HTTP — performant, schema-first |
| **TypeScript** | 5.4 | Typage statique sur tout le backend |
| **Node.js** | ≥ 20 | Runtime JavaScript côté serveur |
| **Knex.js** | 3.1 | Query builder SQL + système de migrations |
| **pg** | 8.11 | Driver PostgreSQL natif pour Node.js |
| **Redis** | 4.6 | Client Redis pour le cache |
| **bcrypt** | 5.1 | Hachage des mots de passe (coût 12) |
| **@fastify/jwt** | 8.0 | Authentification JWT (access + refresh tokens) |
| **@fastify/cors** | 9.0 | Gestion du Cross-Origin Resource Sharing |
| **@fastify/helmet** | 11.1 | Headers de sécurité HTTP (XSS, clickjacking…) |
| **@fastify/rate-limit** | 9.1 | Limitation du débit (100 req/min) |
| **@fastify/multipart** | 8.3 | Upload de fichiers multipart |
| **@fastify/swagger** | 8.14 | Génération de la documentation OpenAPI |
| **@fastify/swagger-ui** | 3.0 | Interface Swagger UI sur `/docs` |
| **AWS SDK S3** | 3 | Upload d'images vers MinIO (compatible S3) |
| **prom-client** | 15.1 | Exposition des métriques Prometheus sur `/metrics` |
| **Zod** | 3.22 | Validation des données entrantes |
| **Pino** | 8.19 | Logger structuré JSON haute performance |
| **qrcode** | 1.5 | Génération de QR codes pour le 2FA |

---

## 2. Base de données & stockage

| Outil | Version | Rôle |
|---|---|---|
| **PostgreSQL** | 16 | Base de données relationnelle principale |
| **Redis** | 7 | Cache applicatif, sessions, rate limiting |
| **MinIO** | latest | Stockage d'objets compatible S3 (images des articles) |

---

## 3. Infrastructure — Production (K3s)

Le serveur de production est un VPS qui fait tourner **K3s**, une distribution Kubernetes légère.

```
Internet
    │
    ▼
Traefik (Ingress Controller + TLS)
    │
    ├── collector-shop.online → Frontend (React)
    └── /api → Backend (Fastify)
              │
              ├── PostgreSQL
              ├── Redis
              ├── MinIO
              ├── Prometheus
              └── Grafana
```

| Outil | Rôle |
|---|---|
| **K3s** | Kubernetes léger pour le serveur de production |
| **Traefik** | Ingress controller — reverse proxy + terminaison TLS |
| **cert-manager** | Gestion automatique des certificats TLS via Let's Encrypt |
| **Let's Encrypt** | Autorité de certification — HTTPS gratuit et automatique |
| **Docker** | Containerisation de l'application (images frontend et backend) |
| **GHCR** | GitHub Container Registry — stockage des images Docker |
| **kubectl** | Outil CLI pour interagir avec le cluster Kubernetes |

### Manifests Kubernetes (namespace `collector-prod`)

| Fichier | Ce qu'il déploie |
|---|---|
| `00-namespace.yaml` | Namespace `collector-prod` |
| `01-secrets.yaml` | Secrets (DB passwords, JWT secret…) |
| `02-configmap.yaml` | Configuration applicative |
| `03-postgres.yaml` | Deployment + PVC PostgreSQL |
| `04-redis.yaml` | Deployment Redis |
| `05-minio.yaml` | Deployment MinIO + PVC |
| `06-backend.yaml` | Deployment Backend Fastify |
| `07-frontend.yaml` | Deployment Frontend React |
| `08-ingress.yaml` | Ingress Traefik + TLS Let's Encrypt |
| `09-prometheus.yaml` | Deployment Prometheus |
| `10-grafana.yaml` | Deployment Grafana |

---

## 4. Monitoring

### Prometheus

Prometheus tourne dans le cluster et scrape le backend toutes les 15 secondes via l'endpoint `/metrics`.

**Métriques techniques** (collectées automatiquement par `prom-client`) :
- CPU, mémoire, event loop lag, garbage collector
- `http_request_duration_seconds` — durée des requêtes HTTP par route et status code
- `http_requests_total` — compteur total de requêtes
- `http_active_requests` — connexions actives en temps réel

**Métriques métier** (custom) :
- `collector_registered_users_total` — nombre d'utilisateurs inscrits (initialisé depuis la DB au démarrage, incrémenté à chaque inscription)
- `collector_active_products_total` — nombre d'articles actifs (incrémenté/décrémenté à chaque création/suppression)

### Grafana

Interface de visualisation connectée à Prometheus. Permet de créer des dashboards avec des panels PromQL.

**Système d'alertes** : seuils configurables par panel → envoi de notifications sur **Discord** via webhook lorsqu'une métrique dépasse un seuil. Les alertes peuvent être silencées manuellement.

---

## 5. Tests

### Tests unitaires — Vitest

| Outil | Rôle |
|---|---|
| **Vitest** | Runner de tests — rapide, compatible Vite |
| **@testing-library/react** | Rendu de composants React en test |
| **@testing-library/jest-dom** | Matchers DOM supplémentaires |
| **jsdom** | Simulation du DOM navigateur en Node.js |
| **@vitest/coverage-v8** | Rapport de couverture de code (lcov, HTML, JSON) |

Couverture cible : **> 80%** (vérifiée par SonarCloud).

### Tests d'intégration — Testcontainers

| Outil | Rôle |
|---|---|
| **Testcontainers** | Démarre de vrais conteneurs Docker (PostgreSQL) pendant les tests |
| **Vitest** | Runner (config dédiée `vitest.config.integration.ts`) |

Les tests d'intégration testent les routes API complètes (enregistrement, login, catalogue…) contre une vraie base de données PostgreSQL éphémère, sans mocks.

### Tests E2E — Playwright

| Outil | Rôle |
|---|---|
| **Playwright** | Automatisation de navigateur (Chromium) |
| **@playwright/test** | Framework de test E2E |

Tests exécutés contre `https://collector-shop.online` (production). Parcours testés : inscription, connexion, navigation catalogue, détail produit.

### Tests de performance — k6

| Outil | Rôle |
|---|---|
| **k6** | Outil de test de charge open-source (Grafana Labs) |

4 scénarios de test :

| Fichier | Type | Description |
|---|---|---|
| `smoke-test.js` | Smoke | 1 VU, 30s — vérifie que l'app répond |
| `load-test.js` | Charge | 0→20 VUs sur 8 min — comportement normal |
| `stress-test.js` | Stress | 0→100 VUs sur 9 min — limites de l'app |
| `auth-flow-test.js` | Scénario | Login → catalogue → détail produit |

---

## 6. CI/CD — GitHub Actions

Deux workflows distincts :

### `ci.yml` — Intégration continue

Déclenché sur chaque push sur `main` et `develop`.

```
push
 │
 ├── build-backend (tsc)
 ├── build-frontend (vite build)
 │
 ├── lint-backend (ESLint)   ← needs build
 ├── lint-frontend (ESLint)  ← needs build
 │
 ├── test-backend (Vitest + PostgreSQL service)   ← needs lint
 ├── test-frontend (Vitest)                        ← needs lint
 ├── test-integration (Vitest + Testcontainers)    ← needs lint
 │
 ├── docker-build (validation images)   ← needs tests
 ├── test-e2e (Playwright)              ← needs docker-build (continue-on-error)
 ├── performance-smoke (k6, main only)  ← needs docker-build (continue-on-error)
 ├── sonarcloud (analyse qualité)       ← needs tests
 └── security (npm audit + TruffleHog) ← indépendant
```

### `deploy.yml` — Déploiement continu

Déclenché automatiquement quand la CI passe sur `main`, ou manuellement.

```
CI success (main)
 │
 ├── build & push images → GHCR (frontend:sha + backend:sha)
 ├── trivy-scan (vulnérabilités des images)
 │
 ├── deploy → kubectl set image (K3s)
 ├── migrate → npm run migrate dans le pod backend
 │
 ├── rollback automatique si deploy ou migration échouent
 └── zap-scan (OWASP ZAP — DAST sur la production)
```

---

## 7. Qualité du code — SonarCloud

| Seuil | Valeur cible |
|---|---|
| Couverture de code | > 80% |
| Duplication | < 3% |
| Bugs critiques | 0 |
| Vulnérabilités | 0 |
| Code smells bloquants | 0 |
| Complexité cognitive | < 15 par fonction |
| Dette technique | < 5% |

SonarCloud analyse le frontend et le backend à chaque CI, en consommant les rapports de couverture LCOV générés par Vitest.

---

## 8. Sécurité

| Outil | Type | Rôle |
|---|---|---|
| **TruffleHog** | SAST | Scan de secrets hardcodés dans le code et l'historique git |
| **npm audit** | SCA | Détection de vulnérabilités dans les dépendances |
| **Trivy** | SCA | Scan des images Docker (vulnérabilités OS + librairies) |
| **OWASP ZAP** | DAST | Test dynamique de l'application en production (XSS, SQLi…) |
| **Helmet** | Runtime | Headers de sécurité HTTP sur toutes les réponses |
| **bcrypt** | Runtime | Hachage des mots de passe (coût 12) |
| **Rate limiting** | Runtime | 100 requêtes/minute par IP |
| **JWT** | Runtime | Authentification sans session serveur |
| **2FA TOTP** | Runtime | Double authentification avec QR code (otplib) |
| **TLS 1.3** | Réseau | Chiffrement des communications (cert-manager + Let's Encrypt) |

### Résultats visibles dans

- **GitHub → Security → Code scanning** : résultats Trivy (vulnérabilités des images)
- **GitHub → Actions → Deploy → Artifacts** : rapport HTML OWASP ZAP

---

## 9. Linting & formatage

| Outil | Rôle |
|---|---|
| **ESLint** | Analyse statique du code TypeScript/React |
| **@typescript-eslint** | Règles ESLint spécifiques TypeScript |
| **eslint-plugin-react-hooks** | Règles pour les hooks React |
| **eslint-plugin-react-refresh** | Compatibilité avec le HMR de Vite |

---

## 10. Outillage développeur

| Outil | Rôle |
|---|---|
| **npm workspaces** | Monorepo — gestion des dépendances frontend/backend depuis la racine |
| **tsx** | Exécution TypeScript sans compilation (migrations, scripts) |
| **tsc-alias** | Résolution des alias de chemins après compilation TypeScript |
| **concurrently** | Lance frontend et backend en parallèle avec `npm run dev` |
| **pino-pretty** | Formatage lisible des logs Pino en développement |
| **Docker Compose** | Stack locale complète (PostgreSQL, Redis, MinIO) |

---

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                        DÉVELOPPEMENT                        │
│  TypeScript · React · Fastify · Knex · Zod · Tailwind CSS   │
│  ESLint · Vitest · Testcontainers · Playwright · k6         │
└────────────────────────┬────────────────────────────────────┘
                         │ git push
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      CI/CD (GitHub Actions)                  │
│  Build → Lint → Test → Docker Build → SonarCloud            │
│  Deploy → Trivy → Migrate → OWASP ZAP                       │
│  TruffleHog · npm audit (sécurité)                          │
└────────────────────────┬────────────────────────────────────┘
                         │ kubectl set image
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   PRODUCTION (K3s / VPS)                    │
│  Traefik · cert-manager · Let's Encrypt                     │
│  Frontend (React) · Backend (Fastify)                       │
│  PostgreSQL 16 · Redis 7 · MinIO                            │
│  Prometheus · Grafana (dashboards + alertes Discord)        │
└─────────────────────────────────────────────────────────────┘
```
