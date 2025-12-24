# 🚀 COMMENCER ICI - Guide Rapide

**Temps estimé : 15 minutes pour tester la CI/CD**

---

## Étape 1 : Test Local (2 min)

```bash
# Vérifier que tout fonctionne
./test-ci.sh
```

✅ Si tout est vert, passez à l'étape 2

❌ Si des erreurs, les corriger avant de continuer

---

## Étape 2 : Push sur GitHub (5 min)

### 2.1 Créer le repo sur GitHub

1. Aller sur https://github.com/new
2. Nom du repo : `collector-shop`
3. Visibilité : **Private**
4. **Ne pas** cocher "Initialize with README"
5. Créer

### 2.2 Pousser le code

```bash
# Ajouter le remote (remplacer VOTRE-USERNAME)
git remote add origin https://github.com/VOTRE-USERNAME/collector-shop.git

# Vérifier
git remote -v

# Commit final
git add .
git commit -m "feat: complete project setup with CI/CD"

# Push
git branch -M main
git push -u origin main
```

### 2.3 Vérifier GitHub Actions

1. Sur GitHub → Onglet **"Actions"**
2. Voir le workflow **"CI"** en cours
3. Attendre 3-5 minutes
4. **Vérifier que c'est vert ✅**

---

## Étape 3 : Test avec une Pull Request (5 min)

```bash
# Créer une branche
git checkout -b test/ci-verification

# Petit changement
echo "✅ CI/CD Pipeline configurée et testée" >> README.md

# Commit et push
git add README.md
git commit -m "docs: add CI/CD status"
git push origin test/ci-verification
```

**Sur GitHub :**
1. Cliquer sur **"Compare & pull request"**
2. Créer la PR
3. Vérifier que les 3 workflows passent :
   - ✅ CI
   - ✅ PR Checks
   - ✅ Docker Build
4. **Merger la PR**

---

## ✅ BRAVO ! Votre CI/CD fonctionne !

Vous avez maintenant :
- ✅ Tests automatiques sur chaque push
- ✅ Vérification des PRs
- ✅ Build Docker automatisé
- ✅ Pipeline prête pour le déploiement

---

## 🚀 Prochaine étape : Déployer

**Vous avez 2 options :**

### Option A : Déploiement Simple (Gratuit)
**Temps : 30 min** • **Difficulté : ⭐⭐☆☆☆**

Suivre le guide : **`DEPLOY-GUIDE.md`**

- Frontend sur Vercel (gratuit)
- Backend sur Render (gratuit)
- Base de données incluse

### Option B : Déploiement Docker (VPS)
**Temps : 1h** • **Difficulté : ⭐⭐⭐⭐☆**

Nécessite un serveur (DigitalOcean, Hetzner, etc.)

```bash
# Sur votre serveur
git clone https://github.com/VOTRE-USERNAME/collector-shop.git
cd collector-shop

# Build et lancer
docker compose -f docker-compose.prod.yml up -d
```

---

## 📚 Documentation

| Fichier | Description |
|---------|-------------|
| **START-HERE.md** | ⚡ Ce fichier - Démarrage rapide |
| **DEPLOY-GUIDE.md** | 📦 Guide complet de déploiement |
| **QUICK-TEST-CI.md** | 🧪 Guide de test CI/CD |
| `.github/CICD.md` | 📖 Documentation CI/CD complète |
| `.github/TEST-CI.md` | 🔬 Tests avancés avec act |

---

## 🆘 Besoin d'aide ?

**Le workflow CI échoue ?**
→ Lire `.github/CICD.md` section "Troubleshooting"

**Problème de déploiement ?**
→ Lire `DEPLOY-GUIDE.md` section "🆘 Troubleshooting"

**Vérifier la configuration ?**
```bash
./.github/check-ci-setup.sh
```

---

## 🎯 Ce que vous devez faire MAINTENANT

1. [ ] ✅ Exécuter `./test-ci.sh`
2. [ ] ✅ Push sur GitHub
3. [ ] ✅ Vérifier que GitHub Actions est vert
4. [ ] ✅ Créer une PR de test et merger
5. [ ] 🚀 Déployer (suivre DEPLOY-GUIDE.md)

**Commencez par l'étape 1 ci-dessus ! ☝️**

