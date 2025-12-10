# 🚀 Test Rapide de votre CI/CD

Ce guide vous montre comment tester votre CI/CD en **5 minutes** !

---

## ⚡ Option 1 : Test Local (Le plus rapide)

### 1. Lancer le script de test automatique

```bash
./test-ci.sh
```

Ce script va :
- ✅ Vérifier Docker
- ✅ Lancer PostgreSQL et Redis
- ✅ Installer les dépendances
- ✅ Linter le code
- ✅ Exécuter tous les tests
- ✅ Builder le projet

**Temps estimé : 2-3 minutes**

### 2. Résoudre les problèmes éventuels

Si le script échoue, il vous indiquera où est le problème :

**Problème : Docker non lancé**
```bash
# Solution : Lancer Docker Desktop
```

**Problème : Tests échouent**
```bash
# Voir les détails des tests
npm run test:backend
npm run test:frontend
```

**Problème : Lint échoue**
```bash
# Corriger automatiquement
npm run lint:frontend -- --fix
npm run lint:backend -- --fix
```

---

## 🌐 Option 2 : Test sur GitHub (Recommandé)

### 1. Initialiser Git et créer le repo GitHub

```bash
# Si git n'est pas initialisé
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "feat: setup project with CI/CD"

# Créer un repo sur GitHub.com, puis :
git remote add origin https://github.com/VOTRE-USERNAME/collector.shop.git

# Pousser
git branch -M main
git push -u origin main
```

### 2. Voir les workflows s'exécuter

1. Aller sur : `https://github.com/VOTRE-USERNAME/collector.shop`
2. Cliquer sur l'onglet **"Actions"**
3. Vous verrez le workflow **"CI - Tests & Build"** en cours

### 3. Vérifier les résultats

**✅ Si tout est vert :**
Parfait ! Votre CI/CD fonctionne !

**❌ Si c'est rouge :**
1. Cliquer sur le workflow en erreur
2. Lire les logs
3. Corriger le problème localement
4. Push à nouveau :
   ```bash
   git add .
   git commit -m "fix: resolve CI issues"
   git push
   ```

---

## 🔄 Option 3 : Test avec une Pull Request

### 1. Créer une branche de test

```bash
git checkout -b test/verify-ci

# Faire un petit changement
echo "# Test CI/CD" >> README.md

# Commit et push
git add .
git commit -m "test: verify CI/CD pipeline"
git push origin test/verify-ci
```

### 2. Créer la Pull Request

1. Sur GitHub, cliquer sur **"Compare & pull request"**
2. Titre : `test: verify CI/CD pipeline`
3. Créer la PR

### 3. Observer les checks

Vous verrez ces workflows :
- ✅ CI - Tests & Build
- ✅ PR Checks (titre, conflicts, security)
- ✅ Docker Build

**Tous doivent être verts !**

### 4. Merger (optionnel)

Si tout est vert, vous pouvez merger. Cela déclenchera un déploiement en staging.

---

## 📊 Checklist Rapide

Avant de pousser sur GitHub, vérifiez :

- [ ] Docker est lancé
- [ ] `./test-ci.sh` passe sans erreurs
- [ ] Tous les fichiers sont committés
- [ ] Le repo GitHub est créé

---

## 🎯 Commandes Utiles

```bash
# Tester tout localement
./test-ci.sh

# Tester seulement le backend
npm run test:backend

# Tester seulement le frontend
npm run test:frontend

# Linter et corriger automatiquement
npm run lint:backend -- --fix
npm run lint:frontend -- --fix

# Build
npm run build

# Voir les logs Docker
docker compose logs -f
```

---

## 🆘 En cas de problème

### Le script test-ci.sh n'existe pas
```bash
chmod +x test-ci.sh
```

### Erreur "Cannot connect to database"
```bash
# Relancer les services
docker compose down
docker compose up -d
sleep 10
```

### Erreur sur GitHub Actions mais pas en local
- Vérifier que le `.env` n'est pas committé
- Vérifier les versions de Node.js
- Lire les logs détaillés sur GitHub

---

## 📚 Documentation Complète

Pour plus de détails, consultez :
- `.github/TEST-CI.md` - Guide complet de test
- `.github/CICD.md` - Documentation CI/CD complète

---

## ✨ C'est tout !

Une fois que `./test-ci.sh` passe et que GitHub Actions est vert, votre CI/CD est fonctionnelle ! 🎉
