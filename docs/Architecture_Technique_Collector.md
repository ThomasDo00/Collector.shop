# Architecture Technique - Collector.shop
**Version** : 1.0 | **Date** : 21 novembre 2025 | **Équipe** : 3 Développeurs

---

## 1. Vue d'Ensemble

### 1.1 Contexte
Marketplace d'objets de collection entre particuliers avec transactions sécurisées (commission 5%), chat temps réel, recommandations personnalisées et détection de fraudes.

### 1.2 Principes Directeurs
- **Simplicité V1, Évolutivité V2** : Monolithe modulaire → Microservices progressif
- **Qualité Logicielle** : Tests automatisés, principes SOLID, architecture hexagonale
- **Coût Optimisé** : Infrastructure adaptée à la charge réelle (65€/mois V1)

---

## 2. Architecture Logicielle : SOLID & Hexagonale

### 2.1 Principes SOLID Appliqués

Notre architecture repose sur les **5 principes SOLID** pour garantir maintenabilité, testabilité et évolutivité :

#### **S - Single Responsibility Principle (Responsabilité Unique)**
```typescript
// ✅ BON : Chaque classe a UNE responsabilité
class PublishArticle {  // Use Case : publier un article
  async execute(data: PublishArticleDTO): Promise<Article> {
    // Logique métier uniquement
  }
}

class PostgresArticleRepository {  // Persistence : sauvegarder
  async save(article: Article): Promise<void> {
    // Logique DB uniquement
  }
}

class S3ImageStorage {  // Storage : uploader images
  async upload(image: File): Promise<string> {
    // Logique S3 uniquement
  }
}
```

#### **O - Open/Closed Principle (Ouvert/Fermé)**
```typescript
// ✅ BON : Ouvert à l'extension, fermé à la modification
interface IPaymentGateway {
  charge(amount: number, token: string): Promise<Payment>;
}

class StripeGateway implements IPaymentGateway { /* Stripe */ }
class PayPalGateway implements IPaymentGateway { /* PayPal */ }

// Ajout de PayPal sans modifier le Use Case
class ProcessPayment {
  constructor(private gateway: IPaymentGateway) {}  // ← Injection
  
  async execute(data: PaymentDTO) {
    return this.gateway.charge(data.amount, data.token);
  }
}
```

#### **L - Liskov Substitution Principle (Substitution de Liskov)**
```typescript
// ✅ BON : Les implémentations sont interchangeables
interface INotificationSender {
  send(userId: string, message: string): Promise<void>;
}

class EmailNotification implements INotificationSender {
  async send(userId: string, message: string) { /* SMTP */ }
}

class PushNotification implements INotificationSender {
  async send(userId: string, message: string) { /* FCM */ }
}

// L'appelant ne sait pas quelle implémentation est utilisée
const notifier: INotificationSender = new EmailNotification();
await notifier.send(userId, "Article vendu !");
```

#### **I - Interface Segregation Principle (Ségrégation des Interfaces)**
```typescript
// ✅ BON : Interfaces spécifiques, pas de dépendances inutiles
interface IArticleReader {
  findById(id: string): Promise<Article | null>;
  search(query: string): Promise<Article[]>;
}

interface IArticleWriter {
  save(article: Article): Promise<void>;
  delete(id: string): Promise<void>;
}

// Le Use Case "SearchArticles" n'a besoin que de la lecture
class SearchArticles {
  constructor(private reader: IArticleReader) {}  // Pas de Writer !
}
```

#### **D - Dependency Inversion Principle (Inversion des Dépendances)**
```typescript
// ✅ BON : Les modules de haut niveau ne dépendent pas des détails
// Domain (haut niveau) définit l'interface
interface IArticleRepository {
  save(article: Article): Promise<void>;
}

// Infrastructure (bas niveau) implémente
class PostgresArticleRepository implements IArticleRepository {
  constructor(private db: Knex) {}
  async save(article: Article) { /* SQL */ }
}

// Injection de dépendance (Fastify)
fastify.register(async (app) => {
  const repo = new PostgresArticleRepository(app.db);
  const useCase = new PublishArticle(repo);  // ← Domain ne connaît pas Postgres
});
```

### 2.2 Architecture Hexagonale (Ports & Adapters)

```
┌────────────────────────────────────────────────────┐
│              ADAPTERS (Entrées/Sorties)            │
│  REST API │ WebSocket │ CLI │ Tests                │
└────────────────────────────────────────────────────┘
                    ↕️ Ports (Interfaces)
┌────────────────────────────────────────────────────┐
│                 DOMAIN (Cœur Métier)               │
│  Entities │ Use Cases │ Business Rules (SOLID ✅)  │
│  ❌ ZÉRO dépendance externe (Fastify, Postgres...) │
└────────────────────────────────────────────────────┘
                    ↕️ Ports (Interfaces)
┌────────────────────────────────────────────────────┐
│         INFRASTRUCTURE (Implémentations)           │
│  PostgreSQL │ Redis │ Stripe │ S3 │ SMTP           │
└────────────────────────────────────────────────────┘
```

**Structure d'un module (exemple : Catalog) :**
```
catalog/
├── domain/                   # ❤️ Logique métier PURE (SOLID)
│   ├── entities/             # Article.ts (Value Objects)
│   ├── usecases/             # PublishArticle.ts (SRP)
│   └── ports/                # IArticleRepository.ts (DIP)
│
├── infrastructure/           # 🔌 Implémentations (OCP)
│   ├── PostgresArticleRepository.ts  # LSP
│   └── S3ImageStorage.ts
│
└── adapters/                 # 🌐 API REST
    └── catalog.routes.ts
```

**Avantages SOLID + Hexagonal :**
- ✅ **Testabilité** : Domain testé sans DB/API (mocks)
- ✅ **Maintenabilité** : Changement Postgres → MongoDB facile
- ✅ **Évolutivité** : Extraction module → microservice simplifié
- ✅ **Qualité** : Code propre, lisible, réutilisable

---

## 3. Stack Technique

### 3.1 Technologies

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| **Frontend** | React 18 + Vite + TypeScript | Performance (Vite 10x > Webpack), typage sûr, écosystème |
| **Backend** | Fastify 4 + TypeScript | 2x plus rapide qu'Express, validation native, SOLID-friendly |
| **BDD** | PostgreSQL 16 | ACID (paiements critiques), relations, full-text search |
| **Cache** | Redis 7 | Sessions, rate limiting, pub/sub chat (< 1ms latence) |
| **Auth** | JWT + Keycloak (V2) | Standard, OAuth2/OIDC, gestion rôles |
| **Paiement** | Stripe | PCI-DSS compliant, 3D Secure, webhooks |
| **Storage** | S3 / MinIO | Images articles, scalable, CDN-ready |
| **Tests** | Vitest + Testcontainers | Rapide, containers réels (Postgres/Redis) |
| **Qualité Code** | SonarQube | Analyse statique, détection bugs, code smells, dette technique |

### 3.2 Modules Métier (Event-Driven)

```
Modules (Bounded Contexts):
├── User        → Inscription, auth, profil
├── Catalog     → Articles, catégories, recherche
├── Payment     → Stripe, transactions
├── Chat        → WebSocket, messages filtrés
├── Notification → Emails, in-app
├── Recommendation → Algorithmes personnalisés
└── Fraud       → Détection anomalies (prix, vendeurs)

Communication: Event Bus (V1 interne, V2 Kafka)
```

**Exemple flux événementiel :**
```
Payment ─[payment.succeeded]→ Catalog → marque "vendu"
                             └→ Notification → emails
                             └→ Fraud → analyse transaction
```

---

## 4. Infrastructure : Docker & Kubernetes

### 4.1 Conteneurisation Docker (V1)

**Dockerfile Backend (Multi-stage) :**
```dockerfile
# Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production (léger : ~150 MB)
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
ENV NODE_ENV=production
EXPOSE 3000
USER node
CMD ["node", "dist/server.js"]
```

**Docker Compose (Dev local) :**
```yaml
services:
  backend:
    build: ./backend
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgresql://collector:pwd@postgres:5432/collector
    depends_on: [postgres, redis]
  
  postgres:
    image: postgres:16-alpine
    volumes: [postgres_data:/var/lib/postgresql/data]
  
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
  
  sonarqube:
    image: sonarqube:community
    ports: ["9000:9000"]
    environment:
      SONAR_JDBC_URL: jdbc:postgresql://postgres:5432/sonar
      SONAR_JDBC_USERNAME: collector
      SONAR_JDBC_PASSWORD: pwd
    volumes: [sonarqube_data:/opt/sonarqube/data]
```

**Utilisation locale :**
```bash
# Analyser le code localement
npm run sonar  # Envoie le rapport à http://localhost:9000
```

### 4.2 Kubernetes (V2 - > 50K users)

**Deployment + Auto-Scaling :**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: collector-backend
spec:
  replicas: 5
  template:
    spec:
      containers:
      - name: backend
        image: collector/backend:1.2.0
        resources:
          requests: {memory: "256Mi", cpu: "250m"}
          limits: {memory: "512Mi", cpu: "500m"}
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  scaleTargetRef:
    kind: Deployment
    name: collector-backend
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource: {name: cpu, target: {averageUtilization: 70}}
```

**Pourquoi Kubernetes plus tard ?**
| Critère | Docker Compose (V1) | Kubernetes (V2) |
|---------|---------------------|-----------------|
| **Complexité** | ✅ Simple | ⚠️ Nécessite DevOps |
| **Coût** | ✅ 65€/mois | ⚠️ 400€/mois |
| **Capacité** | ✅ 5-20K users | ⭐ 100K+ users |
| **Auto-scaling** | ❌ Manuel | ✅ Automatique |
| **Pertinent si** | < 50K users | > 50K users |

---

## 5. Cloud & CI/CD

### 5.1 Cloud Provider : **Scaleway** ⭐

**Comparaison :**
| Provider | Coût V1/mois | RGPD | Support FR | K8s | Recommandation |
|----------|--------------|------|------------|-----|----------------|
| **Scaleway** | **65€** | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| AWS | 220€ | ⚠️ | ❌ | ✅ | ⭐⭐ (trop cher) |
| OVH | 70€ | ✅ | ✅ | ✅ | ⭐⭐⭐⭐ |
| DigitalOcean | 90€ | ⚠️ | ❌ | ✅ | ⭐⭐⭐ |

**Infrastructure Scaleway V1 :**
```
├── VPS DEV1-M (4 vCPU, 8 GB RAM) : 40€/mois
├── PostgreSQL managé (2 vCPU, 4 GB) : 15€/mois
├── Redis managé (1 GB) : 10€/mois
└── TOTAL : 65€/mois → Capacité 5K users simultanés
```

### 5.2 CI/CD : **GitHub Actions** ⭐

**Comparaison :**
| Outil | Minutes gratuites | Complexité | Écosystème | Recommandation |
|-------|-------------------|------------|------------|----------------|
| **GitHub Actions** | **2000/mois** | ✅ Simple | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| GitLab CI | 400/mois | ⚠️ Moyen | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Azure DevOps | 1800/mois | ⚠️ Complexe | ⭐⭐⭐ | ⭐⭐ |

**Pipeline automatisé (`.github/workflows/ci-cd.yml`) :**
```yaml
name: CI/CD
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services: {postgres: postgres:16, redis: redis:7}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Nécessaire pour SonarQube
      
      - uses: actions/setup-node@v4
      
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage
      
      # Analyse SonarQube
      - name: SonarQube Scan
        uses: SonarSource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
  
  build-deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/collector/backend:${{ github.sha }}
      - name: Deploy SSH
        run: ssh user@server "cd /opt/collector && docker-compose pull && docker-compose up -d"
```

**Pipeline : Push → Tests (5min) → SonarQube (2min) → Build Docker (3min) → Deploy (2min) → Total ~12min**

---

## 6. Roadmap & Budget

### 6.1 Phases de Déploiement

| Phase | Période | Infrastructure | Budget/mois | Capacité |
|-------|---------|----------------|-------------|----------|
| **V1 MVP** | Mois 0-3 | Docker Compose, 1 VPS | **65€** | 5K users |
| **V1.5** | Mois 4-6 | Load Balancer, 2 VPS, DB réplica | **150€** | 20K users |
| **V2** | Mois 7-12 | Kubernetes 3 nodes | **400€** | 100K users |
| **V3** | Année 2+ | Multi-région | **1000€** | 500K+ users |

### 6.2 Budget Global V1

```
Infrastructure:
├── Scaleway (VPS + DB + Redis) : 65€/mois
├── SendGrid (emails) : 50€/mois
├── Stripe (1.4% + 0.25€/tx) : ~80€/mois
├── CloudFlare (CDN) : 0€ (free tier)
└── TOTAL : ~195€/mois

Équipe (3 devs) : 12 000€/mois

ROI attendu (Mois 6):
- 1000 transactions/mois × 5% × 50€ moyenne = 2 500€ revenus/mois
```

---

## 7. Monitoring & Sécurité

### 7.1 Qualité de Code : SonarQube

**Intégration continue de la qualité** pour garantir le respect des principes SOLID :

**Métriques analysées :**
```
Quality Gate:
├── Coverage : > 80% (tests unitaires)
├── Duplications : < 3% (respect DRY)
├── Code Smells : 0 blockers, < 5 majeurs
├── Bugs : 0 critiques
├── Vulnerabilities : 0 (sécurité)
├── Technical Debt : < 5% (maintenabilité)
└── Cognitive Complexity : < 15 par fonction (SRP)
```

**Règles SOLID vérifiées :**
- **SRP** : Complexité cyclomatique < 10 par méthode
- **OCP** : Détection de code dupliqué (refactoring interfaces)
- **LSP** : Analyse des hiérarchies de classes
- **ISP** : Détection d'interfaces trop larges
- **DIP** : Détection de couplage fort

**Configuration (sonar-project.properties) :**
```properties
sonar.projectKey=collector-backend
sonar.sources=src
sonar.tests=tests
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.exclusions=**/*.test.ts,**/node_modules/**
sonar.qualitygate.wait=true
```

**Dashboard SonarQube** : Accessible à toute l'équipe pour suivi continu de la qualité.

### 7.2 Observabilité
- **Logs** : Pino (JSON structuré) → Loki → Grafana
- **Métriques** : Prometheus (CPU, RAM, latence API)
- **Alertes** : Slack si error rate > 5% ou latence > 1s
- **Tracing** : Jaeger (V2, microservices)

### 7.3 Sécurité
- **Auth** : JWT (bcrypt cost 12), rate limiting 100 req/min
- **HTTPS** : TLS 1.3 obligatoire (Let's Encrypt)
- **RGPD** : Données en France (Scaleway), anonymisation
- **Scans** : Snyk (vulnérabilités), npm audit (CI/CD)

---

## 8. Conclusion

### Choix Architecturaux
✅ **Architecture Hexagonale + SOLID** : Qualité, testabilité, évolutivité  
✅ **SonarQube intégré** : Garantie continue du respect des principes SOLID  
✅ **Stack moderne** : React+Vite / Fastify / PostgreSQL  
✅ **Docker dès V1** : Migration K8s transparente en V2  
✅ **Scaleway** : Meilleur rapport qualité/prix (65€/mois)  
✅ **GitHub Actions** : CI/CD gratuit et simple  

### Next Steps
1. ✅ Valider architecture avec la direction
2. 🔨 Setup repositories GitHub + Docker Compose
3. 🔨 Configurer CI/CD (pipeline automatisé)
4. 🚀 Développer MVP (3 mois)

**L'architecture permet à l'équipe de se concentrer sur les fonctionnalités métier plutôt que l'infrastructure, tout en préparant la scalabilité future via les principes SOLID et l'architecture hexagonale.**

---

**Rédigé par** : Lead Developer | **Date** : 21 novembre 2025 | **Version** : 1.0
