# 🚀 Guide de Déploiement - Collector.shop

Ce guide vous accompagne de A à Z pour tester votre CI/CD et déployer votre application.

---

## 📋 Plan d'action

1. **Préparer le projet** (5 min)
2. **Configurer GitHub** (10 min)
3. **Tester la CI/CD** (5 min)
4. **Choisir une plateforme de déploiement** (15-30 min)
5. **Déployer l'application** (30 min)

---

## ÉTAPE 1️⃣ : Préparer le projet

### 1.1 Vérifier que tout fonctionne localement

```bash
# Tester localement
./test-ci.sh
```

**Résultat attendu :** ✅ Tous les tests passent

### 1.2 Vérifier Git

```bash
# Vérifier le statut
git status

# Voir les modifications
git diff
```

### 1.3 Créer un commit propre

```bash
# Ajouter tous les fichiers
git add .

# Vérifier ce qui va être committé
git status

# Committer
git commit -m "feat: setup complete CI/CD pipeline with deployment workflows"
```

---

## ÉTAPE 2️⃣ : Configurer GitHub

### 2.1 Créer le repository GitHub

1. Aller sur https://github.com
2. Cliquer sur **"New repository"**
3. Nom : `collector.shop` (ou autre)
4. Visibilité : **Private** (recommandé pour un projet commercial)
5. Ne pas initialiser avec README (vous en avez déjà un)
6. Créer le repository

### 2.2 Connecter votre projet local à GitHub

```bash
# Ajouter le remote (remplacer VOTRE-USERNAME)
git remote add origin https://github.com/VOTRE-USERNAME/collector.shop.git

# Vérifier
git remote -v

# Pousser
git branch -M main
git push -u origin main
```

### 2.3 Vérifier que la CI s'exécute

1. Aller sur votre repo GitHub
2. Cliquer sur l'onglet **"Actions"**
3. Vous devriez voir le workflow **"CI"** en cours d'exécution

**⏱️ Temps d'exécution : ~3-5 minutes**

### 2.4 Résoudre les problèmes éventuels

**Si le workflow échoue :**

1. Cliquer sur le workflow en rouge
2. Cliquer sur le job qui a échoué (backend, frontend, ou security)
3. Lire les logs
4. Corriger le problème localement
5. Committer et pousser à nouveau

**Problèmes courants :**

```bash
# Problème : Coverage < 80%
# Solution : Ajouter des tests
npm run test:coverage -w backend
npm run test:coverage -w frontend

# Problème : Lint échoue
# Solution : Corriger automatiquement
npm run lint:backend -- --fix
npm run lint:frontend -- --fix

# Puis recommitter
git add .
git commit -m "fix: resolve CI issues"
git push
```

---

## ÉTAPE 3️⃣ : Tester avec une Pull Request

### 3.1 Créer une branche de test

```bash
# Créer une branche
git checkout -b test/verify-ci-pipeline

# Faire un petit changement
echo "## CI/CD Pipeline" >> README.md
echo "✅ CI/CD configured and working!" >> README.md

# Committer
git add README.md
git commit -m "docs: add CI/CD status to README"

# Pousser
git push origin test/verify-ci-pipeline
```

### 3.2 Créer la Pull Request

1. Aller sur GitHub
2. Cliquer sur **"Compare & pull request"**
3. Titre : `docs: add CI/CD status to README`
4. Description :
   ```
   ## Description
   Test de la pipeline CI/CD complète
   
   ## Checklist
   - [x] Tests locaux passent
   - [x] Lint OK
   - [x] Build OK
   ```
5. Cliquer sur **"Create pull request"**

### 3.3 Observer les workflows

Vous devriez voir **3 workflows** s'exécuter :

✅ **CI** - Tests & Build
- Backend tests
- Frontend tests  
- Coverage checks
- Security audit

✅ **PR Checks**
- Validation titre PR
- Vérification conflits
- Bundle size check
- Scan de sécurité

✅ **Docker Build**
- Build image backend
- Build image frontend

**Attendez que tout soit vert ✅**

### 3.4 Merger la PR

Si tous les checks sont verts :

1. Cliquer sur **"Merge pull request"**
2. **"Confirm merge"**
3. Supprimer la branche de test (optionnel)

**Cela déclenchera le workflow de déploiement sur main !**

---

## ÉTAPE 4️⃣ : Choisir une plateforme de déploiement

Vous avez plusieurs options selon votre budget et expertise :

### Option A : Vercel (Frontend) + Render (Backend) 
**🆓 Gratuit** • ⚡ Rapide • 👍 Recommandé pour débuter

- **Frontend :** Vercel
- **Backend :** Render
- **Base de données :** Render PostgreSQL ou Supabase
- **Redis :** Upstash

**Avantages :**
- ✅ Gratuit pour commencer
- ✅ Setup très simple
- ✅ SSL automatique
- ✅ Scaling automatique

**Inconvénients :**
- ⚠️ Limites gratuites (500h/mois pour Render)
- ⚠️ Cold starts

### Option B : Railway 
**💰 $5/mois** • ⚡⚡ Très rapide • 🎯 Tout-en-un

- Déploie backend, frontend, PostgreSQL, Redis en un seul endroit
- Configuration minimale
- Excellent pour les monorepos

### Option C : Fly.io
**💰 ~$10/mois** • 🚀 Performance • 🌍 Multi-région

- Conteneurs Docker
- Déploiement global
- Bon contrôle

### Option D : VPS (DigitalOcean, Linode, Hetzner)
**💰 $5-12/mois** • 🔧 Contrôle total • 📚 Plus technique

- Contrôle complet
- Configuration manuelle
- Nécessite DevOps

### Option E : AWS/GCP/Azure
**💰💰 Variable** • 🏢 Production • 🎓 Complexe

- Pour production à grande échelle
- Coût et complexité élevés

---

## ÉTAPE 5️⃣ : Déployer (Option A - Vercel + Render)

### 5.1 Déployer le Frontend sur Vercel

**1. Créer un compte Vercel**
- Aller sur https://vercel.com
- Sign up avec GitHub

**2. Importer le projet**
```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
cd frontend
vercel

# Suivre les prompts :
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? collector-frontend
# - Directory? ./
# - Override settings? No
```

**3. Configurer les variables d'environnement**

Sur Vercel Dashboard :
1. Project Settings → Environment Variables
2. Ajouter :
   ```
   VITE_API_URL=https://votre-backend.onrender.com
   ```

**4. Redéployer**
```bash
vercel --prod
```

### 5.2 Déployer le Backend sur Render

**1. Créer un compte Render**
- Aller sur https://render.com
- Sign up avec GitHub

**2. Créer une base de données PostgreSQL**
1. Dashboard → New → PostgreSQL
2. Name: `collector-db`
3. Plan: **Free**
4. Create Database
5. **Copier l'URL interne** (Internal Database URL)

**3. Créer un Redis**
1. Dashboard → New → Redis
2. Name: `collector-redis`
3. Plan: **Free**
4. Create Redis
5. **Copier l'URL interne**

**4. Créer le Web Service**
1. Dashboard → New → Web Service
2. Connect your GitHub repo
3. Configuration :
   ```
   Name: collector-backend
   Environment: Node
   Region: Frankfurt (ou plus proche)
   Branch: main
   Root Directory: backend
   Build Command: npm install && npm run build
   Start Command: npm start
   Plan: Free
   ```

**5. Ajouter les variables d'environnement**

Dans Environment Variables :
```bash
NODE_ENV=production
DATABASE_URL=[Coller l'URL PostgreSQL interne]
REDIS_URL=[Coller l'URL Redis interne]
JWT_SECRET=[Générer un secret de 32+ caractères]
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=30d
API_HOST=0.0.0.0
API_PORT=10000
```

**6. Créer le service**

**7. Exécuter les migrations**

Dans le Shell de Render :
```bash
npm run migrate
```

**8. Copier l'URL du backend**

Example: `https://collector-backend.onrender.com`

**9. Mettre à jour Vercel**

Retourner sur Vercel et mettre à jour `VITE_API_URL` avec cette URL.

### 5.3 Vérifier le déploiement

**Frontend :**
```bash
# Ouvrir dans le navigateur
open https://votre-app.vercel.app
```

**Backend :**
```bash
# Tester l'API
curl https://votre-backend.onrender.com/health

# Devrait retourner :
{"status":"ok","timestamp":"...","uptime":...}
```

**Test complet :**
1. Ouvrir l'app frontend
2. Essayer de s'inscrire
3. Essayer de se connecter

---

## ÉTAPE 6️⃣ : Automatiser le déploiement

### 6.1 Configurer les secrets GitHub

Settings → Secrets and variables → Actions → New repository secret

Ajouter :
```
VERCEL_TOKEN=[Depuis vercel.com/account/tokens]
VERCEL_ORG_ID=[Depuis .vercel/project.json après premier deploy]
VERCEL_PROJECT_ID=[Depuis .vercel/project.json]
```

### 6.2 Modifier le workflow deploy.yml

Le workflow est déjà créé, il faut juste le configurer pour Vercel/Render.

**Pour Vercel :** Ajouter dans `.github/workflows/deploy.yml`

```yaml
- name: Deploy to Vercel
  run: |
    npm install -g vercel
    cd frontend
    vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

**Pour Render :** 
- Render déploie automatiquement quand on push sur main
- Pas besoin de configuration supplémentaire

### 6.3 Tester le déploiement automatique

```bash
# Faire un changement
echo "// Test auto-deploy" >> backend/src/server.ts

# Commit et push
git add .
git commit -m "test: verify auto-deployment"
git push origin main

# Observer sur GitHub Actions
# → Le workflow Deploy devrait se lancer
# → Vérifier sur Render que le backend se redéploie
```

---

## 📊 Résumé de l'architecture déployée

```
┌─────────────────────────────────────────────────┐
│              UTILISATEUR                        │
└────────────────┬────────────────────────────────┘
                 │
                 │ HTTPS
                 ▼
┌─────────────────────────────────────────────────┐
│         Frontend (Vercel)                       │
│         https://collector.vercel.app            │
└────────────────┬────────────────────────────────┘
                 │
                 │ API Calls
                 ▼
┌─────────────────────────────────────────────────┐
│         Backend (Render)                        │
│         https://collector-api.onrender.com      │
└───┬─────────────────────────┬───────────────────┘
    │                         │
    │ PostgreSQL              │ Redis
    ▼                         ▼
┌─────────┐              ┌─────────┐
│   DB    │              │  Cache  │
│ (Render)│              │ (Render)│
└─────────┘              └─────────┘
```

---

## 🎯 Checklist finale

Avant de considérer le déploiement comme terminé :

**CI/CD :**
- [ ] Tous les workflows GitHub Actions sont verts
- [ ] Les PR déclenchent les checks automatiquement
- [ ] Les merges déploient automatiquement

**Backend :**
- [ ] API accessible publiquement
- [ ] Healthcheck fonctionne (`/health`)
- [ ] Base de données connectée
- [ ] Migrations exécutées
- [ ] Redis connecté

**Frontend :**
- [ ] Site accessible publiquement
- [ ] Connecté au bon backend
- [ ] Inscription fonctionne
- [ ] Login fonctionne

**Sécurité :**
- [ ] HTTPS activé partout
- [ ] Secrets configurés (pas en dur dans le code)
- [ ] CORS configuré correctement
- [ ] Rate limiting activé

---

## 🆘 Troubleshooting

### Backend ne démarre pas sur Render

**Vérifier les logs :** Dashboard → Logs

**Problèmes courants :**
```bash
# Port incorrect
# Render utilise PORT en variable d'env
# Modifier backend/src/server.ts pour utiliser process.env.PORT

# Migrations non exécutées
# Aller dans Shell et exécuter : npm run migrate

# Variables d'environnement manquantes
# Vérifier que toutes les vars sont configurées
```

### Frontend ne peut pas contacter le backend

**Vérifier :**
1. VITE_API_URL est correctement configuré
2. CORS est autorisé pour l'origine Vercel
3. Le backend est bien en HTTPS (pas HTTP)

**Fix CORS dans backend/src/server.ts :**
```typescript
await fastify.register(cors, {
  origin: [
    'http://localhost:5173',
    'https://votre-app.vercel.app'
  ],
  credentials: true,
});
```

### Cold starts sur Render (gratuit)

Le plan gratuit de Render met l'app en veille après 15 min d'inactivité.

**Solutions :**
1. Upgrader au plan payant ($7/mois)
2. Utiliser un service de ping (UptimeRobot) pour garder l'app active
3. Accepter les cold starts (~30 secondes)

---

## 🚀 Prochaines étapes

Une fois déployé :

1. **Monitoring :** Ajouter Sentry pour tracking des erreurs
2. **Analytics :** Ajouter Google Analytics ou Plausible
3. **Domain custom :** Configurer collector.shop
4. **Email :** Configurer SendGrid pour les emails
5. **S3 Storage :** Configurer pour les images produits
6. **Stripe :** Configurer pour les paiements

---

## 📚 Ressources

- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [GitHub Actions](https://docs.github.com/actions)

