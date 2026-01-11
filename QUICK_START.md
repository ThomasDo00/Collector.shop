# 🚀 Quick Start - Collector.shop

Guide rapide pour démarrer le projet en 5 minutes.

## Installation rapide

```bash
# 1. Cloner et installer
git clone <repo-url>
cd Collector.shop
npm install

# 2. Démarrer les services
npm run docker:up

# 3. Initialiser la base de données
npm run db:migrate
npm run db:seed

# 4. Démarrer l'application
npm run dev
```

**C'est tout!** L'application est accessible sur:
- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- API Docs: http://localhost:4000/docs

## Connexion

Utilisez ces credentials de test:

```
Email: buyer1@collector.shop
Password: Test123!@#
```

## Commandes essentielles

```bash
npm run dev              # Démarre frontend + backend
npm run db:seed          # Réinitialise les données de test
npm run test:fullstack   # Teste toute la stack
npm run db:test          # Teste la base de données
```

## Problème?

```bash
# Reset complet
npm run docker:down
npm run docker:up
npm run db:migrate
npm run db:seed
npm run dev
```

## Documentation complète

- [SETUP.md](./SETUP.md) - Guide complet d'installation
- [backend/src/core/database/seeds/README.md](./backend/src/core/database/seeds/README.md) - Documentation des seeds

