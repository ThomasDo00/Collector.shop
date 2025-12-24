# Guide de Test CI/CD

Ce guide vous explique comment tester votre pipeline CI/CD avant de déployer en production.

---

## 🎯 Méthodes de test

### 1. Test Local (Recommandé pour débuter)
### 2. Test avec act (Simulation GitHub Actions en local)
### 3. Test sur GitHub avec une branche de test
### 4. Test complet avec une Pull Request

---

## 📋 Méthode 1 : Test Local des Scripts

Avant de pousser sur GitHub, testez que tous les scripts fonctionnent localement.

### Étape 1 : Vérifier les dépendances

```bash
# Installer toutes les dépendances
npm install

# Vérifier la version de Node.js (doit être >= 20)
node --version
```

### Étape 2 : Tester le Lint

```bash
# Lint backend
npm run lint:backend

# Lint frontend
npm run lint:frontend

# Ou les deux
npm run lint
```

**Résultat attendu :** ✅ Pas d'erreurs de lint

### Étape 3 : Lancer les services Docker

```bash
# Démarrer PostgreSQL et Redis
npm run docker:up

# Vérifier que les services sont lancés
docker compose ps
```

**Résultat attendu :**
```
NAME                          STATUS
collector-postgres-1          Up
collector-redis-1             Up
```

### Étape 4 : Tester le Backend

```bash
# Lancer les tests backend
npm run test:backend

# Vérifier la couverture
npm run test:coverage -w backend
```

**Résultat attendu :** ✅ Tous les tests passent, couverture >80%

### Étape 5 : Tester le Frontend

```bash
# Lancer les tests frontend
npm run test:frontend

# Vérifier la couverture
npm run test:coverage -w frontend
```

### Étape 6 : Tester le Build

```bash
# Build backend
npm run build:backend

# Build frontend
npm run build:frontend

# Ou les deux
npm run build
```

**Résultat attendu :** ✅ Build réussi sans erreurs

---

## 🐳 Méthode 2 : Test avec act (Simulation locale de GitHub Actions)

`act` permet de tester les workflows GitHub Actions localement.

### Installation de act

**Linux/macOS :**
```bash
# Avec Homebrew
brew install act

# Ou avec curl
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

**Windows :**
```bash
# Avec Chocolatey
choco install act-cli

# Ou avec Scoop
scoop install act
```

### Utilisation de act

```bash
# Lister tous les workflows
act -l

# Tester le workflow CI complet
act push

# Tester uniquement le job backend
act -j backend

# Tester uniquement le job frontend
act -j frontend

# Tester les PR checks
act pull_request
```

**Note :** act utilise Docker pour simuler les runners GitHub. Assurez-vous que Docker est lancé.

### Limites de act
- Ne simule pas parfaitement GitHub Actions
- Les services (PostgreSQL, Redis) peuvent être lents
- Certaines actions GitHub peuvent ne pas fonctionner

---

## 🚀 Méthode 3 : Test sur GitHub (Simple Push)

La méthode la plus fiable : tester directement sur GitHub.

### Étape 1 : Initialiser Git et créer le repo

```bash
# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "feat: setup CI/CD pipeline"

# Créer le repo sur GitHub (via l'interface web), puis :
git remote add origin https://github.com/VOTRE-USERNAME/collector.shop.git

# Pousser sur GitHub
git branch -M main
git push -u origin main
```

### Étape 2 : Vérifier l'exécution

1. Aller sur GitHub : `https://github.com/VOTRE-USERNAME/collector.shop`
2. Cliquer sur l'onglet **Actions**
3. Vous devriez voir le workflow **"CI - Tests & Build"** en cours d'exécution

### Étape 3 : Analyser les résultats

**Si tout est vert ✅ :**
- Les tests passent
- Le lint est OK
- Le build fonctionne
- La couverture est >80%

**Si c'est rouge ❌ :**
- Cliquer sur le workflow qui a échoué
- Cliquer sur le job en erreur (backend ou frontend)
- Lire les logs pour identifier le problème

---

## 🔄 Méthode 4 : Test Complet avec Pull Request

Cette méthode teste tous les workflows, y compris les PR checks.

### Étape 1 : Créer une branche de test

```bash
# Créer une branche
git checkout -b test/ci-pipeline

# Faire un petit changement (par exemple, modifier un commentaire)
echo "// Test CI/CD" >> backend/src/server.ts

# Committer
git add .
git commit -m "test: verify CI/CD pipeline"

# Pousser
git push origin test/ci-pipeline
```

### Étape 2 : Créer une Pull Request

1. Aller sur GitHub
2. Cliquer sur **"Compare & pull request"**
3. Titre de la PR : `test: verify CI/CD pipeline`
4. Créer la PR

### Étape 3 : Observer les checks

Vous devriez voir ces workflows s'exécuter :

✅ **CI - Tests & Build**
- Backend tests
- Frontend tests
- Coverage checks
- Build

✅ **PR Checks**
- PR title validation
- Merge conflicts check
- Bundle size check
- Security audit

✅ **Docker Build**
- Backend image build
- Frontend image build

### Étape 4 : Vérifier les résultats

**Tous les checks doivent être verts ✅**

Si un check échoue :
1. Cliquer sur "Details" à côté du check
2. Lire les logs
3. Corriger le problème
4. Push un nouveau commit
5. Les checks se relancent automatiquement

### Étape 5 : Merger la PR (optionnel)

Si tous les checks passent, vous pouvez merger la PR. Cela déclenchera :
- Le workflow CI sur main
- Le workflow de déploiement en staging

---

## 🧪 Script de test automatique

Créez un script pour tester tout localement avant de push :

```bash
#!/bin/bash

echo "🧪 Test complet de la CI/CD..."
echo ""

# 1. Lint
echo "📝 Linting..."
npm run lint || exit 1
echo "✅ Lint passed"
echo ""

# 2. Tests
echo "🧪 Running tests..."
npm test || exit 1
echo "✅ Tests passed"
echo ""

# 3. Build
echo "🔨 Building..."
npm run build || exit 1
echo "✅ Build passed"
echo ""

# 4. Coverage check
echo "📊 Checking coverage..."
npm run test:coverage -w backend
npm run test:coverage -w frontend
echo "✅ Coverage checked"
echo ""

echo "✨ Tous les tests sont passés ! Vous pouvez push sur GitHub."
```

Sauvegardez ce script dans `test-ci.sh` :

```bash
chmod +x test-ci.sh
./test-ci.sh
```

---

## 📊 Checklist avant le premier push

- [ ] Docker est lancé (PostgreSQL + Redis)
- [ ] `npm install` exécuté avec succès
- [ ] Tous les tests passent localement
- [ ] Le lint est OK
- [ ] Le build fonctionne
- [ ] Le fichier `.env` est configuré
- [ ] Git est initialisé
- [ ] Le repo GitHub est créé

---

## 🐛 Problèmes courants et solutions

### ❌ "npm ERR! Missing script: test:backend"

**Cause :** Scripts manquants dans package.json

**Solution :** Vérifier que les scripts existent dans le package.json racine

### ❌ Tests échouent avec "Cannot connect to database"

**Cause :** PostgreSQL n'est pas lancé ou mauvaise URL

**Solution :**
```bash
# Vérifier que Docker est lancé
docker compose ps

# Si pas lancé
npm run docker:up
```

### ❌ "Coverage is below 80%"

**Cause :** Pas assez de tests

**Solution :**
```bash
# Voir le rapport détaillé
npm run test:coverage -w backend

# Ajouter des tests pour les fichiers non couverts
```

### ❌ Workflow échoue sur GitHub mais pas en local

**Cause :** Différences d'environnement

**Solution :**
- Vérifier les versions de Node.js (local vs GitHub Actions)
- Vérifier les variables d'environnement
- Lire les logs détaillés sur GitHub

---

## 📈 Workflow de test recommandé

```
1. Développer en local
   ↓
2. Tester avec ./test-ci.sh
   ↓
3. Commit et push sur une branche
   ↓
4. Créer une PR
   ↓
5. Vérifier que tous les checks passent
   ↓
6. Merger la PR
   ↓
7. Vérifier le déploiement en staging
   ↓
8. Déployer en production (manuel)
```

---

## 🎓 Ressources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [act - Local GitHub Actions](https://github.com/nektos/act)
- [Conventional Commits](https://www.conventionalcommits.org/)

