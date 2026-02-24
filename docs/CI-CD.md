# CI/CD - Collector.shop

## Vue d'ensemble

Le projet utilise **GitHub Actions** pour automatiser les tests, la qualité du code, la sécurité et le déploiement. Quatre workflows sont configurés :

| Workflow | Déclencheur | Rôle |
|----------|-------------|------|
| `ci.yml` | Push/PR sur `main` et `develop` | Lint, tests, coverage, build |
| `pr-checks.yml` | Ouverture/modification de PR | Titre sémantique, conflits, bundle, audit |
| `deploy.yml` | Push sur `main` ou manuel | Build Docker → K3s → Migrations → OWASP ZAP |
| `docker-build.yml` | Push `main`/`develop` et PRs | Build images Docker (sans push) |

---

## Workflows détaillés

### CI (`ci.yml`)

- Lint backend + frontend
- Tests unitaires (PostgreSQL 16 + Redis 7 intégrés via services)
- Coverage > 80% obligatoire
- Build backend et frontend
- Upload des artefacts de coverage

### PR Checks (`pr-checks.yml`)

- Validation du titre de PR (format [Conventional Commits](https://www.conventionalcommits.org/)) :
  ```
  feat: Add user authentication
  fix: Resolve login bug
  docs: Update README
  refactor: Restructure user module
  test: Add login tests
  chore: Update dependencies
  ```
- Détection de conflits de merge
- Vérification de la taille du bundle (warning si > 5 MB)
- `npm audit` — warning sur moderate+
- Scan de secrets avec TruffleHog

### Deploy (`deploy.yml`)

Déclenché automatiquement sur chaque push `main`, ou manuellement via `Actions → Deploy → Run workflow`.

**Pipeline :**
1. Build et push des images Docker vers GHCR (`ghcr.io/thomasdo00/collector`)
2. Scan de sécurité Trivy (CRITICAL + HIGH)
3. Déploiement K3s : `kubectl set image` sur namespace `collector-prod`
4. Attente du rollout (timeout 5 min)
5. Migrations DB via `kubectl exec`
6. Scan OWASP ZAP sur `https://collector-shop.online`
7. **Rollback automatique** si deploy ou migrate échoue

**Secrets requis dans GitHub :**

| Secret | Description |
|--------|-------------|
| `KUBE_CONFIG` | Config kubectl encodée en base64 |
| `GITHUB_TOKEN` | Fourni automatiquement par GitHub |

### Docker Build (`docker-build.yml`)

Build des images backend et frontend sans push (vérification de la compilabilité des Dockerfiles sur chaque PR).

---

## Quality Gates

| Métrique | Seuil | Comportement |
|----------|-------|--------------|
| Coverage | > 80% | Bloque le build |
| Lint | 0 erreur | Bloque le build |
| Tests | 100% pass | Bloque le build |
| Audit sécurité | Moderate+ | Warning uniquement |
| Bundle size | < 5 MB | Warning uniquement |

---

## Workflow de développement

```
1. Créer une branche depuis main
   git checkout -b feat/ma-fonctionnalite

2. Développer et committer (format Conventional Commits)
   git commit -m "feat: description"

3. Push et créer une PR
   → CI + PR Checks s'exécutent automatiquement
   → Vérifier que tous les checks passent ✅

4. Merger la PR
   → Déploiement automatique sur collector-shop.online
```

---

## Tester localement avant de push

```bash
# Lint
npm run lint

# Tests (nécessite Docker lancé pour la DB)
npm run docker:up
npm test

# Build
npm run build

# Coverage
npm run test:coverage -w backend
npm run test:coverage -w frontend
```

### Simuler GitHub Actions localement (optionnel)

```bash
# Installer act
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Tester le job backend
act -j backend

# Tester le job frontend
act -j frontend
```

---

## Troubleshooting

### CI échoue sur les tests

```bash
# Vérifier localement
npm test

# Vérifier que Docker tourne
docker compose ps

# Si DB inaccessible
npm run docker:up
```

### Coverage < 80%

```bash
# Voir le rapport détaillé
npm run test:coverage -w backend
npm run test:coverage -w frontend
# Les fichiers non couverts apparaissent dans le rapport HTML (coverage/)
```

### Le déploiement K3s échoue

1. Vérifier que `KUBE_CONFIG` est bien configuré dans les secrets GitHub
2. Lire les logs du workflow sur GitHub → onglet **Actions**
3. En cas de rollback automatique, vérifier l'état des pods :
   ```bash
   kubectl get pods -n collector-prod
   kubectl describe deployment/backend -n collector-prod
   ```

### Workflow échoue sur GitHub mais pas en local

- Vérifier la version de Node.js (GitHub Actions utilise celle définie dans le workflow)
- S'assurer que le `.env` n'est pas commité
- Lire les logs détaillés dans l'onglet Actions

---

## Ressources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [act - Local GitHub Actions](https://github.com/nektos/act)
- [Trivy Scanner](https://github.com/aquasecurity/trivy)
