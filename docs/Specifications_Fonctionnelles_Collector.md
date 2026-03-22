# Spécifications Fonctionnelles — Collector.shop

**Version** : 2.0 — État réel de l'application
**Date** : Mars 2026
**Projet** : Marketplace C2C d'objets de collection
**URL production** : https://collector-shop.online

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Acteurs](#2-acteurs)
3. [Modules fonctionnels implémentés](#3-modules-fonctionnels-implémentés)
   - 3.1 Authentification & Compte
   - 3.2 Catalogue & Articles
   - 3.3 Panier
   - 3.4 Favoris
   - 3.5 Profil vendeur
   - 3.6 Création d'annonce
   - 3.7 Paiement & Commande
4. [API REST — Endpoints disponibles](#4-api-rest--endpoints-disponibles)
5. [Règles métier](#5-règles-métier)
6. [Modèle de données](#6-modèle-de-données)

---

## 1. Vue d'ensemble

Collector.shop est une marketplace web permettant à des particuliers d'acheter et vendre des objets de collection entre eux (C2C). La plateforme prend une commission de **5 %** sur chaque transaction et garantit la sécurité des paiements en les centralisant.

**Objets ciblés** : sneakers en édition limitée, posters dédicacés, figurines originales, cassettes vintage, et tout objet de collection du quotidien.

**Exclus** : objets de luxe, brocante classique.

**Modèle économique** :
- Commission 5 % sur le montant de chaque vente
- Frais de livraison fixes : 8,90 €
- Paiements centralisés via Stripe (le vendeur reçoit son argent 7 jours après confirmation de livraison)

---

## 2. Acteurs

| Acteur | Description |
|---|---|
| **Visiteur** | Peut parcourir le catalogue et consulter les fiches produit sans compte |
| **Acheteur** (buyer) | Utilisateur inscrit pouvant ajouter au panier, acheter, mettre en favoris |
| **Vendeur** (seller) | Utilisateur inscrit pouvant publier des annonces et gérer ses ventes |
| **Vendeur de confiance** | Vendeur avec score > 4,5/5 et 20+ ventes — publication sans validation admin |
| **Administrateur** (admin) | Valide les articles, gère les utilisateurs, accède aux métriques |

> Un même utilisateur peut être à la fois acheteur et vendeur.

---

## 3. Modules fonctionnels implémentés

### 3.1 Authentification & Compte

#### Inscription (`/register`)

- Formulaire avec : email, nom d'utilisateur (3–30 caractères), mot de passe (min. 8 caractères), prénom, nom
- Validation côté client (React Hook Form + Zod) et côté serveur
- Hachage du mot de passe avec bcrypt (coût 12)
- Envoi d'un email de vérification après inscription
- Erreurs gérées : email déjà utilisé (409), nom d'utilisateur déjà pris (409), champs manquants (400)

#### Connexion (`/login`)

- Identifiant : email **ou** nom d'utilisateur (`emailOrUsername`)
- Retourne un access token JWT à la connexion réussie
- Gestion des cas : identifiants invalides (401), compte suspendu, compte banni, email non vérifié
- Redirection automatique vers la page précédente après connexion

#### Double authentification — 2FA TOTP (`/settings`)

- Activation via QR code scannable avec une app d'authentification (Google Authenticator, Authy…)
- Flux d'activation : setup → affichage QR code → saisie du code TOTP → activation confirmée
- Désactivation : saisie du code TOTP actuel pour confirmation
- À la connexion, si 2FA activé : saisie du code TOTP requis après le mot de passe
- Backend : génération du secret TOTP avec `otplib`, QR code avec `qrcode`

#### Déconnexion

- Invalidation du token côté serveur
- Nettoyage de l'état Redux côté client

#### Paramètres (`/settings`)

- Gestion du 2FA (activation / désactivation)
- Affichage de l'état actuel du 2FA

---

### 3.2 Catalogue & Articles

#### Page d'accueil (`/`)

- Présentation de la plateforme
- Mise en avant de produits récents ou populaires
- Navigation vers le catalogue

#### Catalogue (`/catalog`)

- Liste paginée de tous les articles actifs
- **Filtres disponibles** :
  - Catégorie (`/api/catalog/products?category=...`)
  - Prix minimum / maximum
  - État de l'article (neuf, très bon état, bon état, état correct)
  - Statut
- **Tri disponible** :
  - Plus récents (défaut)
  - Prix croissant
  - Prix décroissant
  - Plus populaires
- **Recherche** par mot-clé (barre de recherche avec suggestions)
- Cache Redis (5 minutes) sur les listes de produits
- Affichage en grille avec : image, titre, prix, vendeur, état

#### Fiche produit (`/product/:id`)

- Galerie d'images avec sélection
- Titre, description, prix, état, catégorie
- Informations vendeur (avatar, nom d'utilisateur)
- Produits similaires (même catégorie)
- Bouton **"Ajouter au panier"** (acheteur authentifié, pas son propre article)
- Bouton **"Ajouter aux favoris"** / retirer des favoris (authentifié)
- Cache Redis (5 minutes) sur la fiche produit

#### Catégories

- Liste de toutes les catégories avec nom, slug, description, icône et nombre d'articles
- Cache Redis (1 heure)

---

### 3.3 Panier (`/cart`)

- Visible uniquement pour les utilisateurs authentifiés
- **Contenu du panier** : liste des articles avec image, titre, prix, vendeur, quantité
- **Récapitulatif financier** :
  - Sous-total
  - Commission 5 %
  - Frais de livraison : 8,90 € (fixe)
  - Total
- Actions :
  - Retirer un article du panier
  - Vider le panier entièrement
  - Passer à la commande
- Si non authentifié : message "Votre panier est vide" + bouton "Se connecter"
- Si authentifié mais panier vide : message + suggestion de naviguer dans le catalogue

---

### 3.4 Favoris (`/favorites`)

- Liste des articles mis en favoris par l'utilisateur authentifié
- Affichage : image, titre, prix, catégorie, état, vendeur
- Ajout aux favoris : idempotent (pas de doublon si article déjà en favoris)
- Suppression des favoris
- Tri par date d'ajout (plus récent en premier)
- Vérification de l'état favori sur la fiche produit (cœur rempli / vide)

---

### 3.5 Profil vendeur (`/profile/:username`)

- Informations publiques : avatar, nom d'utilisateur
- Liste des annonces actives du vendeur

---

### 3.6 Mes annonces (`/my-listings`)

- Liste des articles publiés par l'utilisateur connecté
- Filtrage par statut (actif, vendu, expiré…)
- Accès rapide à la suppression d'une annonce

#### Création d'annonce (`/create-listing`)

- Formulaire : titre, description, prix, catégorie, état, images
- Upload d'image vers MinIO (stockage S3-compatible)
- Validation : prix positif, titre obligatoire, catégorie obligatoire
- Après création : incrémentation de la métrique `collector_active_products_total`

#### Suppression d'annonce

- Seul le propriétaire peut supprimer (vérification `seller_id === userId`)
- Tentative par un autre utilisateur → 403 Forbidden
- Après suppression : décrémentation de la métrique `collector_active_products_total`

---

### 3.7 Paiement & Commande (`/checkout`)

- Page de récapitulatif avant paiement
- Intégration Stripe (3D Secure)
- Le paiement transite par la plateforme (pas d'échange direct acheteur/vendeur)
- Commission 5 % prélevée automatiquement
- Le vendeur reçoit le paiement **7 jours** après confirmation de livraison

---

## 4. API REST — Endpoints disponibles

### Utilisateurs — `/api/users`

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/register` | Non | Créer un compte |
| POST | `/login` | Non | Se connecter, retourne JWT |
| POST | `/logout` | Oui | Se déconnecter |
| POST | `/mfa/verify-login` | Non | Valider le code TOTP à la connexion |
| POST | `/mfa/setup` | Oui | Générer le QR code 2FA |
| POST | `/mfa/enable` | Oui | Activer le 2FA (avec code TOTP) |
| POST | `/mfa/disable` | Oui | Désactiver le 2FA (avec code TOTP) |
| GET | `/profile/:username` | Non | Profil public d'un utilisateur |
| GET | `/profile/:username/listings` | Non | Annonces d'un utilisateur |
| GET | `/health` | Non | Santé du module utilisateur |

### Catalogue — `/api/catalog`

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/categories` | Non | Liste des catégories |
| GET | `/products` | Non | Liste des produits (filtres, tri) |
| GET | `/products/:id` | Non | Détail d'un produit |
| POST | `/products` | Oui | Créer un article |
| DELETE | `/products/:id` | Oui | Supprimer son article |
| POST | `/upload` | Oui | Uploader une image |

### Panier — `/api/cart`

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/:userId` | Non | Récupérer le panier avec totaux calculés |
| POST | `/:userId/items` | Non | Ajouter un article au panier |
| DELETE | `/:userId/items/:itemId` | Non | Retirer un article |
| DELETE | `/:userId` | Non | Vider le panier entièrement |

### Favoris — `/api/favorites`

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | Oui | Liste des articles favoris |
| POST | `/` | Oui | Ajouter un article aux favoris |
| DELETE | `/:productId` | Oui | Retirer un article des favoris |

### Métriques — `/metrics`

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/metrics` | Non | Métriques Prometheus au format texte |

---

## 5. Règles métier

| Règle | Détail |
|---|---|
| Commission | 5 % sur chaque transaction |
| Délai de paiement vendeur | 7 jours après confirmation de livraison |
| Frais de livraison | 8,90 € fixes |
| Validation des articles | Requise par un admin avant publication, sauf vendeurs de confiance |
| Vendeur de confiance | Score > 4,5/5 avec 20+ ventes → publication directe sans validation |
| Limite d'annonces | 100 articles actifs maximum par vendeur |
| Expiration des annonces | 90 jours sans vente → expiration automatique |
| Achat de ses propres articles | Interdit — bouton "Ajouter au panier" masqué pour le propriétaire |
| Suppression d'article | Réservée au propriétaire (403 Forbidden sinon) |
| Hachage des mots de passe | bcrypt, coût 12 |
| Rate limiting | 100 requêtes / minute par IP |
| Paiements | Toujours centralisés via la plateforme — échange direct interdit |

---

## 6. Modèle de données

### Table `users`

| Champ | Type | Description |
|---|---|---|
| `id` | UUID | Identifiant unique |
| `email` | VARCHAR | Email unique |
| `username` | VARCHAR | Nom d'utilisateur unique (3–30 car.) |
| `password_hash` | VARCHAR | Mot de passe haché (bcrypt) |
| `first_name` | VARCHAR | Prénom |
| `last_name` | VARCHAR | Nom |
| `role` | ENUM | `buyer`, `seller`, `admin`, `visitor` |
| `avatar_url` | VARCHAR | URL de l'avatar |
| `mfa_secret` | VARCHAR | Secret TOTP pour le 2FA |
| `mfa_enabled` | BOOLEAN | 2FA activé ou non |
| `seller_score` | DECIMAL | Note vendeur (0–5) |
| `total_sales` | INTEGER | Nombre total de ventes |
| `status` | ENUM | `active`, `suspended`, `banned` |
| `email_verified` | BOOLEAN | Email vérifié |
| `created_at` | TIMESTAMP | Date de création |

### Table `products`

| Champ | Type | Description |
|---|---|---|
| `id` | UUID | Identifiant unique |
| `seller_id` | UUID | Référence vers `users.id` |
| `title` | VARCHAR | Titre de l'annonce |
| `description` | TEXT | Description détaillée |
| `price` | DECIMAL | Prix en euros |
| `category_name` | VARCHAR | Catégorie |
| `condition` | ENUM | `new`, `like_new`, `good`, `fair` |
| `status` | ENUM | `active`, `sold`, `expired`, `pending` |
| `image_url` | VARCHAR | URL de l'image principale |
| `created_at` | TIMESTAMP | Date de publication |

### Table `categories`

| Champ | Type | Description |
|---|---|---|
| `id` | UUID | Identifiant unique |
| `name` | VARCHAR | Nom affiché |
| `slug` | VARCHAR | Identifiant URL unique |
| `description` | TEXT | Description |
| `icon_url` | VARCHAR | URL de l'icône |
| `product_count` | INTEGER | Nombre d'articles actifs |

### Table `cart_items`

| Champ | Type | Description |
|---|---|---|
| `id` | UUID | Identifiant unique |
| `user_id` | UUID | Référence vers `users.id` |
| `product_id` | UUID | Référence vers `products.id` |
| `quantity` | INTEGER | Quantité (défaut : 1) |
| `updated_at` | TIMESTAMP | Dernière modification |

### Table `favorites`

| Champ | Type | Description |
|---|---|---|
| `user_id` | UUID | Référence vers `users.id` |
| `product_id` | UUID | Référence vers `products.id` |
| `created_at` | TIMESTAMP | Date d'ajout |
| Contrainte | UNIQUE | `(user_id, product_id)` — pas de doublon possible |
