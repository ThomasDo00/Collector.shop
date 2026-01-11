# 🚀 Setup Guide - Collector.shop

Guide de configuration pour les développeurs du projet.

## Prérequis

- Node.js >= 20.0.0
- Docker et Docker Compose
- npm

## Installation initiale

### 1. Cloner le projet

```bash
git clone <repository-url>
cd Collector.shop
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Le fichier .env est déjà configuré pour le développement local
# Vous n'avez normalement rien à changer
```

### 4. Démarrer les services Docker

```bash
# Démarre PostgreSQL, Redis et MinIO
npm run docker:up

# Vérifier que les containers sont en cours d'exécution
docker ps
```

### 5. Initialiser la base de données

```bash
# Exécuter les migrations (crée les tables)
npm run db:migrate

# Insérer les données de test
npm run db:seed
```

### 6. Démarrer l'application

```bash
# Démarre frontend + backend simultanément
npm run dev
```

L'application est maintenant accessible :

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **API Docs**: http://localhost:4000/docs
- **MinIO Console**: http://localhost:9003

## Données de test

Après le seeding, vous pouvez vous connecter avec ces identifiants:

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| buyer1@collector.shop | Test123!@# | Acheteur |
| seller1@collector.shop | Test123!@# | Vendeur |
| admin@collector.shop | Test123!@# | Admin |

## Workflow de développement

### Travailler sur une nouvelle fonctionnalité

```bash
# 1. Créer une branche depuis develop
git checkout develop
git pull
git checkout -b feature/ma-fonctionnalite

# 2. Développer avec hot-reload
npm run dev

# 3. Tester votre code
npm run test
npm run lint

# 4. Vérifier le coverage
npm run test:coverage

# 5. Commit et push
git add .
git commit -m "feat: description de la fonctionnalité"
git push origin feature/ma-fonctionnalite

# 6. Créer une Pull Request sur GitHub
```

### Ajouter une migration de base de données

```bash
# Créer une nouvelle migration
cd backend
npm run db:make create_products_table

# Éditer le fichier généré dans backend/src/core/database/migrations/
# Puis exécuter la migration
npm run db:migrate

# Si erreur, rollback
npm run db:rollback
```

### Ajouter des données de test (seeds)

```bash
# Créer un fichier dans backend/src/core/database/seeds/
# Exemple: 02_seed_categories.ts

# Exécuter tous les seeds
npm run db:seed
```

## Reset complet de la base de données

Si vous voulez repartir de zéro:

```bash
# 1. Rollback toutes les migrations
cd backend
npm run db:rollback

# 2. Re-exécuter les migrations
npm run db:migrate

# 3. Re-insérer les données de test
npm run db:seed
```

## Tests

```bash
# Tests unitaires
npm run test

# Tests avec coverage
npm run test:coverage

# Test de la stack complète
npm run test:fullstack

# Linting
npm run lint
```

## Architecture

```
collector.shop/
├── frontend/              # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/   # Composants réutilisables
│   │   ├── pages/        # Pages de l'application
│   │   ├── features/     # Features avec Redux
│   │   ├── services/     # API clients
│   │   └── types/        # Types TypeScript
│   └── tests/            # Tests unitaires
│
├── backend/              # Fastify + TypeScript
│   ├── src/
│   │   ├── core/         # Config, DB, Logger, Cache
│   │   ├── modules/      # Modules métier (User, Catalog, etc.)
│   │   └── server.ts     # Point d'entrée
│   └── tests/            # Tests unitaires
│
├── docker-compose.yml    # Services Docker
└── .env                  # Variables d'environnement
```

## Dépannage

### Les containers Docker ne démarrent pas

```bash
# Arrêter tous les containers
npm run docker:down

# Nettoyer les volumes
docker volume prune

# Redémarrer
npm run docker:up
```

### Erreur de connexion à la base de données

```bash
# Vérifier que PostgreSQL est bien démarré
docker ps | grep postgres

# Vérifier les logs
docker logs collector-postgres

# Vérifier DATABASE_URL dans .env
cat .env | grep DATABASE_URL
```

### Le frontend ne se connecte pas au backend

```bash
# Vérifier que le backend tourne
curl http://localhost:4000/health

# Vérifier VITE_API_URL dans .env
cat .env | grep VITE_API_URL
```

### Reset complet du projet

```bash
# Arrêter tout
npm run docker:down

# Supprimer node_modules
rm -rf node_modules frontend/node_modules backend/node_modules

# Réinstaller
npm install

# Redémarrer
npm run docker:up
npm run db:migrate
npm run db:seed
npm run dev
```

## Commandes utiles

```bash
# Développement
npm run dev                   # Démarre frontend + backend
npm run dev:frontend          # Frontend uniquement
npm run dev:backend           # Backend uniquement

# Build
npm run build                 # Build frontend + backend
npm run build:frontend        # Frontend uniquement
npm run build:backend         # Backend uniquement

# Tests
npm run test                  # Tests frontend + backend
npm run test:frontend         # Tests frontend
npm run test:backend          # Tests backend
npm run test:coverage         # Coverage frontend + backend
npm run test:fullstack        # Test complet de la stack

# Base de données
npm run db:migrate            # Exécute les migrations
npm run db:rollback           # Rollback la dernière migration
npm run db:seed               # Insère les données de test

# Docker
npm run docker:up             # Démarre PostgreSQL + Redis + MinIO
npm run docker:down           # Arrête tous les containers
npm run docker:logs           # Affiche les logs

# Qualité
npm run lint                  # Lint frontend + backend
npm run lint:frontend         # Lint frontend
npm run lint:backend          # Lint backend
```

## Support

Pour toute question, consultez:

- [CLAUDE.md](./CLAUDE.md) - Instructions pour Claude Code
- [Seeds README](./backend/src/core/database/seeds/README.md) - Données de test
- GitHub Issues - Reporter un bug ou demander une feature

## License

Propriétaire - Collector.shop © 2024
