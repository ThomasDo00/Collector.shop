# CI/CD Documentation - Collector.shop

## Vue d'ensemble

Ce projet utilise GitHub Actions pour automatiser les tests, le build, et le déploiement. Quatre workflows principaux sont configurés :

1. **CI (Continuous Integration)** - Tests et builds automatiques
2. **PR Checks** - Vérifications sur les pull requests
3. **Deploy** - Déploiement automatique/manuel
4. **Docker Build** - Construction d'images Docker

---

## 📋 Workflows

### 1. CI - Tests & Build (`ci.yml`)

**Déclenché sur :** Push et PR sur `main` et `develop`

**Actions :**
- ✅ Lint du code (backend + frontend)
- ✅ Tests unitaires avec PostgreSQL et Redis
- ✅ Vérification de la couverture de code (>80%)
- ✅ Build du backend et frontend
- ✅ Upload des artefacts de couverture

**Services :**
- PostgreSQL 16
- Redis 7

**Variables d'environnement requises :**
Aucune - tout est géré automatiquement dans le workflow

---

### 2. PR Checks (`pr-checks.yml`)

**Déclenché sur :** Ouverture/modification de PR

**Actions :**
- ✅ Validation du titre de PR (format sémantique)
- ✅ Détection de conflits de merge
- ✅ Vérification de la taille du bundle
- ✅ Audit de sécurité (npm audit)
- ✅ Scan de secrets avec TruffleHog

**Format de titre PR accepté :**
```
feat: Add user authentication
fix: Resolve login bug
docs: Update README
style: Format code
refactor: Restructure user module
perf: Optimize database queries
test: Add login tests
chore: Update dependencies
```

---

### 3. Deploy (`deploy.yml`)

**Déclenché sur :**
- Push sur `main` → Déploiement automatique en **staging**
- Manuel via GitHub UI → Choix entre **staging** et **production**

**Environnements :**

#### Staging
- URL : `https://staging.collector.shop`
- Déploiement automatique depuis `main`
- Pas d'approbation requise

#### Production
- URL : `https://collector.shop`
- Déploiement manuel uniquement
- Approbation requise (à configurer dans GitHub)

**À configurer :**

Les secrets suivants doivent être ajoutés dans GitHub :
```
Settings → Secrets and variables → Actions → New repository secret
```

| Secret | Description | Exemple |
|--------|-------------|---------|
| `STAGING_API_URL` | URL de l'API staging | `https://api-staging.collector.shop` |
| `PROD_API_URL` | URL de l'API production | `https://api.collector.shop` |

**TODO dans le workflow :**
- Ajouter les commandes de déploiement réelles
- Configurer les migrations de base de données
- Ajouter les health checks

---

### 4. Docker Build (`docker-build.yml`)

**Déclenché sur :** Push sur `main`/`develop` et PRs

**Actions :**
- 🐳 Build de l'image Docker backend
- 🐳 Build de l'image Docker frontend
- 📦 Cache optimisé avec GitHub Actions cache

**Images créées :**
- `collector-backend:latest`
- `collector-frontend:latest`

---

## 🚀 Configuration initiale

### 1. Push sur GitHub

```bash
# Initialiser le repo git (si pas déjà fait)
git init
git add .
git commit -m "Initial commit with CI/CD"

# Ajouter le remote GitHub
git remote add origin https://github.com/votre-username/collector.shop.git

# Push
git branch -M main
git push -u origin main
```

### 2. Configurer les environnements

Dans GitHub : `Settings → Environments`

Créer deux environnements :

#### Staging
- Pas de protection requise
- Secrets :
  - `STAGING_API_URL`

#### Production
- ✅ Required reviewers (1+)
- ✅ Wait timer (optionnel : 5 minutes)
- Secrets :
  - `PROD_API_URL`

### 3. Configurer les secrets

`Settings → Secrets and variables → Actions`

```bash
# Secrets obligatoires
STAGING_API_URL=https://api-staging.collector.shop
PROD_API_URL=https://api.collector.shop

# Secrets optionnels (pour Docker registry)
DOCKER_USERNAME=votre-username
DOCKER_PASSWORD=votre-token
```

### 4. Activer GitHub Actions

`Settings → Actions → General`

- ✅ Allow all actions and reusable workflows
- ✅ Read and write permissions

---

## 📊 Quality Gates

Le projet applique les standards de qualité suivants :

| Métrique | Seuil | Action |
|----------|-------|--------|
| Couverture de code | > 80% | ❌ Bloque le build si < 80% |
| Lint | 0 erreur | ❌ Bloque le build |
| Tests | 100% pass | ❌ Bloque le build |
| Audit sécurité | Moderate+ | ⚠️ Warning seulement |
| Bundle size | < 5MB | ⚠️ Warning si > 5MB |

---

## 🔄 Workflow typique

### Pour une nouvelle feature

```bash
# 1. Créer une branche
git checkout -b feat/user-authentication

# 2. Développer et committer
git add .
git commit -m "feat: add user authentication"

# 3. Push
git push origin feat/user-authentication

# 4. Créer une PR sur GitHub
# → CI runs automatiquement
# → PR checks s'exécutent
# → Vérifier que tous les checks passent ✅

# 5. Merger la PR
# → Déploiement automatique en staging
# → Vérifier en staging

# 6. Déployer en production (manuel)
# Actions → Deploy → Run workflow → Select "production"
```

---

## 🛠️ Commandes utiles

```bash
# Tester localement avant de push
npm run lint          # Lint
npm test              # Tests
npm run build         # Build

# Simuler le CI localement avec act (optionnel)
act -j backend        # Run backend job
act -j frontend       # Run frontend job
```

---

## 🐛 Troubleshooting

### Le CI échoue sur les tests

1. Vérifier que les tests passent localement :
   ```bash
   npm test
   ```

2. Vérifier les logs dans GitHub Actions

3. Problème de base de données ? Vérifier les migrations

### Le déploiement échoue

1. Vérifier que les secrets sont bien configurés
2. Vérifier les logs du workflow
3. Vérifier que l'environnement cible est accessible

### Coverage < 80%

1. Ajouter des tests pour augmenter la couverture :
   ```bash
   npm run test:coverage -w backend
   npm run test:coverage -w frontend
   ```

2. Voir le rapport de couverture dans les artefacts du workflow

---

## 📈 Métriques et monitoring

Les métriques suivantes sont disponibles :

- **Coverage reports** : Artefacts uploadés à chaque run
- **Build times** : Visible dans l'historique des workflows
- **Deployment history** : Onglet "Environments" dans GitHub

---

## 🔐 Sécurité

Les workflows incluent :

- ✅ Audit npm automatique
- ✅ Scan de secrets (TruffleHog)
- ✅ Trivy scan pour les images Docker (optionnel)
- ✅ Pas de secrets hardcodés dans le code

**Bonnes pratiques :**
- Toujours utiliser des secrets GitHub pour les données sensibles
- Ne jamais committer de fichiers `.env`
- Vérifier régulièrement les dépendances avec `npm audit`

---

## 📚 Ressources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Semantic Pull Requests](https://github.com/amannn/action-semantic-pull-request)

---

## 🎯 TODO / Améliorations futures

- [ ] Ajouter SonarQube pour l'analyse de code
- [ ] Configurer Dependabot pour les mises à jour automatiques
- [ ] Ajouter des tests E2E avec Playwright/Cypress
- [ ] Mettre en place le monitoring avec Sentry
- [ ] Ajouter un workflow de rollback automatique
- [ ] Configurer les notifications Slack/Discord
