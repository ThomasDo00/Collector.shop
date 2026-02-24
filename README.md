# Collector.shop

Marketplace C2C d'objets de collection (sneakers limitées, figurines, posters signés, cassettes vintage...).

**Production** : [https://collector-shop.online](https://collector-shop.online)

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + Vite + TypeScript + Redux Toolkit |
| Backend | Fastify 4 + TypeScript + Knex.js |
| Base de données | PostgreSQL 16 |
| Cache | Redis 7 |
| Stockage | MinIO (S3-compatible) |
| Auth | JWT |
| Tests | Vitest + Testcontainers |
| CI/CD | GitHub Actions |
| Production | Kubernetes (K3s) |

---

## Démarrage rapide

### Prérequis

- Node.js >= 20
- Docker + Docker Compose
- npm >= 10

### Installation

```bash
# Cloner et installer les dépendances
git clone https://github.com/ThomasDo00/collector.git
cd Collector.shop
npm install

# Copier la configuration locale
cp .env.example .env

# Démarrer PostgreSQL, Redis et MinIO
npm run docker:up

# Initialiser la base de données
npm run db:migrate
npm run db:seed

# Démarrer l'application
npm run dev
```

### URLs locales

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| API Docs (Swagger) | http://localhost:3000/docs |
| MinIO Console | http://localhost:9001 |

### Comptes de test (après seed)

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| buyer1@collector.shop | Test123!@# | Acheteur |
| seller1@collector.shop | Test123!@# | Vendeur |
| admin@collector.shop | Test123!@# | Admin |

---

## Commandes disponibles

### Développement

```bash
npm run dev              # Frontend + backend en parallèle
npm run dev:frontend     # Frontend seul (http://localhost:5173)
npm run dev:backend      # Backend seul (http://localhost:3000)
```

### Tests

```bash
npm test                          # Tous les tests
npm run test:coverage -w backend  # Coverage backend
npm run test:coverage -w frontend # Coverage frontend
npm run test:watch -w backend     # Mode watch
```

### Build

```bash
npm run build            # Frontend + backend
npm run build:frontend
npm run build:backend
```

### Base de données

```bash
npm run db:migrate       # Exécuter les migrations
npm run db:rollback      # Rollback de la dernière migration
npm run db:seed          # Insérer les données de test
npm run db:make <name>   # Créer une nouvelle migration
```

### Docker (développement local)

```bash
npm run docker:up        # Démarrer PostgreSQL + Redis + MinIO
npm run docker:down      # Arrêter les services
npm run docker:logs      # Afficher les logs
```

### Qualité

```bash
npm run lint             # Lint frontend + backend
npm run lint:frontend    # ESLint frontend
npm run lint:backend     # ESLint backend
```

---

## Architecture

Le projet suit une **architecture hexagonale** avec les principes **SOLID** :

```
backend/src/
├── core/                    # Infrastructure partagée
│   ├── config/              # Configuration (env, Zod validation)
│   ├── database/            # Knex.js + migrations + seeds
│   ├── cache/               # Client Redis
│   └── logger/              # Pino logger
│
└── modules/                 # Modules métier (Bounded Contexts)
    └── user/
        ├── domain/
        │   ├── entities/    # Entités et Value Objects
        │   ├── usecases/    # Cas d'usage (SRP)
        │   └── ports/       # Interfaces (DIP)
        ├── infrastructure/  # Implémentations externes
        └── adapters/        # Routes REST (Fastify)
```

Modules prévus : **User**, **Catalog**, **Payment**, **Chat**, **Notification**, **Recommendation**, **Fraud**.

---

## Variables d'environnement

Voir `.env.example` pour la liste complète.

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL PostgreSQL |
| `REDIS_URL` | URL Redis |
| `JWT_SECRET` | Clé JWT (min 32 caractères) |
| `REFRESH_TOKEN_SECRET` | Clé refresh token |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe |
| `S3_ENDPOINT` | URL MinIO/S3 |
| `S3_ACCESS_KEY` | Clé d'accès S3 |
| `S3_SECRET_KEY` | Clé secrète S3 |

---

## Workflow Git

```bash
# 1. Créer une branche
git checkout -b feat/ma-fonctionnalite

# 2. Développer et committer (format Conventional Commits)
git commit -m "feat: description de la fonctionnalité"

# 3. Push et créer une PR
git push origin feat/ma-fonctionnalite
# → CI s'exécute automatiquement (lint + tests + coverage + build)

# 4. Merger la PR
# → Déploiement automatique sur collector-shop.online
```

---

## Dépannage

### Les containers Docker ne démarrent pas

```bash
npm run docker:down
docker volume prune
npm run docker:up
```

### Reset complet

```bash
npm run docker:down
rm -rf node_modules frontend/node_modules backend/node_modules
npm install
npm run docker:up
npm run db:migrate
npm run db:seed
npm run dev
```

### Erreur de connexion à la base de données

```bash
docker ps | grep postgres        # Vérifier que le container tourne
docker logs collector-postgres   # Voir les logs
```

---

## Documentation

| Fichier | Contenu |
|---------|---------|
| [docs/CI-CD.md](docs/CI-CD.md) | Workflows GitHub Actions, quality gates, troubleshooting CI |
| [docs/DEPLOY.md](docs/DEPLOY.md) | Déploiement Kubernetes, secrets, commandes kubectl |
| [docs/Architecture_Technique_Collector.md](docs/Architecture_Technique_Collector.md) | Architecture technique détaillée |
| [docs/Specifications_Fonctionnelles_Collector.md](docs/Specifications_Fonctionnelles_Collector.md) | Spécifications fonctionnelles |

---

## Licence

Propriétaire — Collector.shop
