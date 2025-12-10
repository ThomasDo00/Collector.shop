# Collector.shop

Marketplace d'objets de collection entre particuliers.

## Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | React 18 + Vite + TypeScript + Redux Toolkit |
| Backend | Fastify 4 + TypeScript + Knex.js |
| Base de données | PostgreSQL 16 |
| Cache | Redis 7 |
| Tests | Vitest + Testcontainers |

## Prérequis

- Node.js >= 20.0.0
- Docker et Docker Compose
- npm >= 10.0.0

## Installation

```bash
# Cloner le repository
git clone https://github.com/votre-org/collector.shop.git
cd collector.shop

# Copier le fichier d'environnement
cp .env.example .env

# Installer les dépendances
npm install

# Démarrer les services Docker (PostgreSQL, Redis, MinIO)
npm run docker:up

# Exécuter les migrations
npm run db:migrate
```

## Développement

```bash
# Démarrer frontend et backend en parallèle
npm run dev

# Ou séparément :
npm run dev:frontend   # http://localhost:5173
npm run dev:backend    # http://localhost:3000
```

### URLs de développement

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| API Documentation | http://localhost:3000/docs |
| MinIO Console | http://localhost:9001 |

## Scripts disponibles

### Racine (monorepo)

```bash
npm run dev              # Démarre frontend + backend
npm run build            # Build les deux projets
npm run test             # Lance tous les tests
npm run lint             # Lint les deux projets
npm run docker:up        # Démarre les services Docker
npm run docker:down      # Arrête les services Docker
npm run docker:logs      # Affiche les logs Docker
npm run db:migrate       # Exécute les migrations
npm run db:seed          # Exécute les seeds
```

### Frontend

```bash
npm run dev:frontend     # Serveur de développement Vite
npm run build:frontend   # Build de production
npm run test:frontend    # Tests avec Vitest
npm run lint:frontend    # ESLint
```

### Backend

```bash
npm run dev:backend      # Serveur avec hot-reload (tsx)
npm run build:backend    # Compilation TypeScript
npm run test:backend     # Tests avec Vitest
npm run lint:backend     # ESLint
```

## Architecture

Le projet suit une **architecture hexagonale** avec les principes **SOLID** :

```
backend/src/
├── core/                    # Infrastructure partagée
│   ├── config/              # Configuration (env, etc.)
│   ├── database/            # Knex.js + migrations
│   ├── cache/               # Client Redis
│   └── logger/              # Pino logger
│
└── modules/                 # Modules métier (Bounded Contexts)
    └── user/
        ├── domain/          # Logique métier pure
        │   ├── entities/    # Entités et Value Objects
        │   ├── usecases/    # Cas d'usage (SRP)
        │   └── ports/       # Interfaces (DIP)
        ├── infrastructure/  # Implémentations (OCP, LSP)
        └── adapters/        # Routes REST API
```

## Tests

```bash
# Tous les tests
npm test

# Tests avec couverture
npm run test:coverage -w frontend
npm run test:coverage -w backend

# Tests en mode watch
npm run test:watch -w backend
```

## Variables d'environnement

Voir `.env.example` pour la liste complète. Variables principales :

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL de connexion PostgreSQL |
| `REDIS_URL` | URL de connexion Redis |
| `JWT_SECRET` | Clé secrète pour les tokens JWT (min 32 caractères) |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe |

## Documentation API

La documentation Swagger est disponible à http://localhost:3000/docs une fois le backend démarré.

## Licence

Propriétaire - Collector.shop
