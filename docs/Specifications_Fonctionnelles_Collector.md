# Spécifications Fonctionnelles Détaillées
## Application Collector.shop

**Version** : 1.0  
**Date** : 21 novembre 2025  
**Projet** : Développement d'une plateforme de vente d'objets de collection entre particuliers  
**Statut** : Document de spécifications - Phase préparatoire

---

## Table des matières

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Contexte et objectifs](#2-contexte-et-objectifs)
3. [Acteurs du système](#3-acteurs-du-système)
4. [Architecture fonctionnelle globale](#4-architecture-fonctionnelle-globale)
5. [Exigences fonctionnelles détaillées](#5-exigences-fonctionnelles-détaillées)
6. [Exigences non fonctionnelles](#6-exigences-non-fonctionnelles)
7. [Règles métier](#7-règles-métier)
8. [Cas d'usage détaillés](#8-cas-dusage-détaillés)
9. [User Stories](#9-user-stories)
10. [Glossaire](#10-glossaire)

---

## 1. Vue d'ensemble du projet

### 1.1 Description générale

Collector.shop est une plateforme web de marketplace dédiée à la vente d'objets de collection entre particuliers. L'application permet aux collectionneurs d'échanger des articles "vintage" rares ou uniques tels que :
- Baskets en édition limitée
- Posters dédicacés
- Figurines originales (ex: Hasbro Star Wars)
- Cassettes V2000 de films
- Tout autre objet de collection du quotidien

**Périmètre exclu** : Objets de luxe et brocante classique

### 1.2 Modèle économique

- Commission de **5% sur chaque transaction**
- Paiements centralisés via la plateforme
- Garantie de qualité assurée par Collector

### 1.3 Infrastructure actuelle de la start-up

**Outils bureautiques** :
- Office 365 Business Standard
- Power BI
- Exchange (messagerie)
- Adobe Creative Cloud

**Équipement** :
- Ordinateurs portables Windows 11
- 1 Mac (conception graphique)
- WiFi fourni par l'incubateur

**Site actuel** : Site vitrine WordPress hébergé chez un fournisseur français

---

## 2. Contexte et objectifs

### 2.1 Contexte métier

Collector est une start-up de 5 ans, initialement spécialisée dans l'événementiel (organisation de salons d'objets de collection en France). Suite à une levée de fonds par crowdfunding, l'entreprise pivote vers le digital avec le développement de Collector.shop.

**Équipe** :
- 2 dirigeants (ex-chefs de projet IT en ESN, spécialistes de l'événementiel)
- 1 responsable administratif et RH
- 1 responsable communication et marketing digital
- 1 lead developer (nouvelle recrue)
- 2 développeurs confirmés (5 ans d'expérience)
- Recrutements prévus selon l'évolution du projet

### 2.2 Objectifs stratégiques

1. **Digitalisation de l'activité** : Passage du physique (salons) au digital (plateforme)
2. **Sécurisation des transactions** : Centralisation des paiements et garantie de qualité
3. **Scalabilité** : Architecture permettant l'ajout rapide de nouvelles fonctionnalités
4. **Automatisation** : Réduction de l'intervention humaine (contrôles, détection de fraudes)
5. **Internationalisation** : Support multilingue et accessibilité
6. **Évolutivité** : Préparation de futures fonctionnalités (enchères, événements en streaming, etc.)

### 2.3 Enjeux critiques

- **Sécurité maximale** : Transactions financières sensibles
- **Expérience utilisateur** : Interface intuitive pour les collectionneurs
- **Conformité** : RGPD, réglementation e-commerce, accessibilité
- **Performance** : Gestion de pics de charge (lancements d'objets rares)
- **Fiabilité** : Disponibilité 24/7 pour une marketplace

---

## 3. Acteurs du système

### 3.1 Utilisateurs principaux

#### 3.1.1 Visiteur (non authentifié)
**Rôle** : Internaute découvrant la plateforme  
**Permissions** :
- Parcourir le catalogue d'objets
- Consulter les fiches produits (photos, descriptions, prix)
- Accéder aux pages informatives (CGV, CGU, À propos)
- Créer un compte

**Restrictions** :
- Impossible d'acheter ou de vendre
- Pas d'accès aux fonctionnalités personnalisées
- Pas d'accès au chat

---

#### 3.1.2 Acheteur (authentifié)
**Rôle** : Utilisateur inscrit souhaitant acquérir des objets  
**Permissions** :
- Toutes les permissions du Visiteur
- Acheter des objets via paiement sécurisé (CB)
- Accéder à son espace personnel :
  - Historique des achats
  - Achats en cours
  - Notifications personnalisées
  - Paramétrage des centres d'intérêt
- Recevoir des recommandations personnalisées
- Utiliser le chat pour échanger avec les vendeurs
- Noter et évaluer les vendeurs
- Gérer les notifications (email, in-app)
- Suivre des articles ou vendeurs favoris

**Restrictions** :
- Impossibilité d'échanger des informations personnelles directes (email, téléphone) dans le chat
- Paiement obligatoire via la plateforme uniquement

---

#### 3.1.3 Vendeur (authentifié)
**Rôle** : Utilisateur inscrit mettant en vente ses objets de collection  
**Permissions** :
- Toutes les permissions de l'Acheteur (double casquette possible)
- Créer plusieurs boutiques virtuelles thématiques
- Publier des articles à la vente :
  - Ajouter photos (multiples)
  - Rédiger description détaillée
  - Fixer le prix
  - Définir les frais de port (calculé automatiquement)
- Modifier le prix d'un article (historique conservé)
- Gérer l'inventaire de ses boutiques
- Accéder aux statistiques de vente (vues, favoris)
- Utiliser le chat pour répondre aux acheteurs
- Consulter l'historique de ses ventes
- Suivre les transactions en cours

**Restrictions** :
- Articles soumis à validation avant publication
- Impossibilité d'échanger des coordonnées personnelles
- Identification obligatoire en tant que "vendeur particulier"
- Respect de la charte de la plateforme (sous peine de suppression)

---

#### 3.1.4 Administrateur (Admin)
**Rôle** : Gestionnaire de la plateforme Collector  
**Permissions** :
- Toutes les permissions des autres utilisateurs (en lecture)
- **Gestion du back-office** :
  - Créer, modifier, supprimer les catégories d'objets
  - Valider ou rejeter les articles proposés par les vendeurs
  - Supprimer des articles non conformes
  - Suspendre ou bannir des utilisateurs
  - Accéder aux statistiques globales de la plateforme
- **Modération** :
  - Consulter l'historique des conversations du chat
  - Intervenir dans les conversations si nécessaire
  - Traiter les signalements utilisateurs
- **Gestion des alertes de sécurité** :
  - Consulter les notifications de détection de fraudes
  - Investiguer les prix suspects ou vendeurs douteux
- **Support client** :
  - Répondre aux demandes d'assistance
  - Gérer les litiges acheteurs/vendeurs

**Restrictions** :
- Accès limité aux données personnelles sensibles (conformité RGPD)
- Traçabilité obligatoire de toutes les actions administratives

---

### 3.2 Acteurs systèmes

#### 3.2.1 Système de paiement
**Rôle** : Passerelle de paiement externe (Stripe, PayPal, etc.)  
**Interactions** :
- Traiter les transactions par carte bancaire (V1)
- Retourner le statut des paiements (succès, échec, en attente)
- Gérer les remboursements éventuels

#### 3.2.2 Service de notification
**Rôle** : Système d'envoi de notifications multicanal  
**Interactions** :
- Envoyer des notifications in-app
- Envoyer des emails transactionnels et marketing
- Gérer les préférences de notification par utilisateur

#### 3.2.3 Moteur de recommandation
**Rôle** : Intelligence artificielle/algorithme de recommandation  
**Interactions** :
- Analyser les centres d'intérêt des acheteurs
- Proposer des articles personnalisés
- (V2) Analyser le parcours de navigation pour affiner les recommandations

#### 3.2.4 Système de détection de fraudes
**Rôle** : Outil d'analyse des anomalies (interne ou externe)  
**Interactions** :
- Recevoir les notifications de changement de prix
- Analyser les comportements suspects (vendeurs, prix anormaux)
- Alerter les administrateurs en cas de fraude potentielle

#### 3.2.5 Service de publicité
**Rôle** : Système d'intégration de publicités ciblées  
**Interactions** :
- Intégrer automatiquement des publicités sur sites partenaires
- Cibler les audiences selon les centres d'intérêt
- Tracker les conversions

---

## 4. Architecture fonctionnelle globale

### 4.1 Modules principaux

```
┌─────────────────────────────────────────────────────────────┐
│                    COLLECTOR.SHOP PLATFORM                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │  Front-Office  │  │  Front-Office  │  │   Back-Office  │ │
│  │   (Public)     │  │  (Authentifié) │  │   (Admins)     │ │
│  └────────────────┘  └────────────────┘  └────────────────┘ │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                     COUCHE MÉTIER                           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│  │ Gestion      │ │ Gestion      │ │ Système de   │         │
│  │ Utilisateurs │ │ Catalogue    │ │ Transaction  │         │
│  └──────────────┘ └──────────────┘ └──────────────┘         │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│  │ Messagerie   │ │ Notifications│ │ Recommanda-  │         │
│  │ (Chat)       │ │              │ │ tions        │         │
│  └──────────────┘ └──────────────┘ └──────────────┘         │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│  │ Validation   │ │ Détection    │ │ Publicités   │         │
│  │ Articles     │ │ Fraudes      │ │ Ciblées      │         │
│  └──────────────┘ └──────────────┘ └──────────────┘         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    SERVICES EXTERNES                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│  │ Paiement     │ │ Email        │ │ Stockage     │         │
│  │ (Stripe/...) │ │ (SMTP)       │ │ Médias (S3)  │         │
│  └──────────────┘ └──────────────┘ └──────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Flux de données principaux

1. **Inscription/Authentification** : Utilisateur ↔ Gestion Utilisateurs ↔ Base de données
2. **Publication d'article** : Vendeur → Validation Articles → Catalogue → Notification Acheteurs
3. **Achat** : Acheteur → Transaction → Paiement externe → Notification Vendeur/Acheteur
4. **Chat** : Utilisateur A ↔ Messagerie ↔ Utilisateur B (+ Filtrage infos personnelles)
5. **Recommandations** : Profil Acheteur → Moteur IA → Articles suggérés
6. **Fraude** : Changement prix → Détection → Alertes Admin

---

## 5. Exigences fonctionnelles détaillées

### 5.1 Gestion des utilisateurs

#### FR-USER-001 : Inscription
**Priorité** : Haute  
**Description** : Un visiteur doit pouvoir créer un compte pour devenir acheteur et/ou vendeur.

**Critères d'acceptation** :
- Formulaire d'inscription accessible depuis toutes les pages
- Champs obligatoires :
  - Adresse email (unique dans le système)
  - Mot de passe (minimum 8 caractères, avec majuscule, chiffre, caractère spécial)
  - Nom d'utilisateur (pseudonyme public)
  - Acceptation des CGU/CGV
  - Consentement RGPD
- Champs optionnels :
  - Prénom/Nom (pour la facturation)
  - Adresse postale (pour les livraisons)
  - Téléphone (pour le support)
- Validation de l'email par envoi d'un lien de confirmation
- Possibilité d'inscription via OAuth (Google, Facebook - optionnel V2)

**Règles de validation** :
- Email au format valide et non déjà utilisé
- Mot de passe conforme à la politique de sécurité
- Pseudonyme unique et sans caractères spéciaux interdits

---

#### FR-USER-002 : Connexion/Déconnexion
**Priorité** : Haute  
**Description** : Un utilisateur inscrit doit pouvoir s'authentifier et se déconnecter.

**Critères d'acceptation** :
- Connexion via email + mot de passe
- Option "Se souvenir de moi" (cookie sécurisé, 30 jours)
- Lien "Mot de passe oublié" → réinitialisation par email
- Session expirée après 24h d'inactivité
- Déconnexion manuelle accessible depuis toutes les pages
- Déconnexion automatique en cas de tentative d'accès non autorisé

---

#### FR-USER-003 : Gestion du profil
**Priorité** : Moyenne  
**Description** : Un utilisateur authentifié doit pouvoir consulter et modifier ses informations personnelles.

**Critères d'acceptation** :
- Page "Mon profil" accessible depuis le menu utilisateur
- Modification possible :
  - Photo de profil
  - Pseudonyme (sous réserve de disponibilité)
  - Adresse email (avec nouvelle validation)
  - Mot de passe (avec confirmation de l'ancien)
  - Adresses de livraison (multiples)
  - Moyens de paiement enregistrés (CB tokenisées)
  - Préférences de notification
- Consultation de l'historique :
  - Achats passés
  - Ventes réalisées
  - Évaluations reçues/données
- Suppression de compte (avec confirmation, anonymisation RGPD)

---

#### FR-USER-004 : Paramétrage des centres d'intérêt
**Priorité** : Moyenne  
**Description** : Un acheteur doit pouvoir définir ses centres d'intérêt pour recevoir des recommandations personnalisées.

**Critères d'acceptation** :
- Interface de sélection des catégories d'intérêt (tags, sliders)
- Liste de catégories prédéfinies par l'admin
- Possibilité de saisir des mots-clés personnalisés
- Modification à tout moment depuis le profil
- Impact immédiat sur les recommandations affichées

---

### 5.2 Gestion du catalogue et des articles

#### FR-CAT-001 : Navigation dans le catalogue
**Priorité** : Haute  
**Description** : Tout visiteur doit pouvoir parcourir le catalogue d'objets sans authentification.

**Critères d'acceptation** :
- Page d'accueil avec articles mis en avant (nouveautés, tendances)
- Navigation par catégories (arborescence créée par l'admin)
- Filtres disponibles :
  - Fourchette de prix (min/max)
  - État de l'objet (neuf, excellent, bon, correct)
  - Localisation du vendeur (pour frais de port)
  - Date de publication (récent en premier)
  - Disponibilité (en stock, vendu)
- Tri possible :
  - Pertinence
  - Prix croissant/décroissant
  - Date de publication (récent/ancien)
  - Popularité (nombre de vues/favoris)
- Barre de recherche avec autocomplétion
- Pagination ou scroll infini (selon choix UX)

---

#### FR-CAT-002 : Consultation d'une fiche produit
**Priorité** : Haute  
**Description** : Un visiteur doit pouvoir consulter le détail d'un article.

**Critères d'acceptation** :
- Affichage des informations :
  - Titre de l'article
  - Description détaillée (texte riche)
  - Galerie photos (carousel, zoom)
  - Prix actuel + historique des variations (si applicable)
  - Frais de port (ou "offerts")
  - État de l'objet
  - Date de mise en ligne
  - Nombre de vues
  - Catégorie
- Informations sur le vendeur :
  - Pseudonyme cliquable (accès à sa boutique)
  - Note moyenne (étoiles sur 5)
  - Nombre d'évaluations
  - Taux de réponse et délai moyen
- Boutons d'action :
  - "Acheter maintenant" (redirige vers paiement si authentifié, sinon vers inscription)
  - "Ajouter aux favoris" (si authentifié)
  - "Contacter le vendeur" (ouvre le chat si authentifié)
- Articles similaires recommandés en bas de page

---

#### FR-CAT-003 : Publication d'un article (Vendeur)
**Priorité** : Haute  
**Description** : Un vendeur doit pouvoir créer une annonce pour vendre un objet.

**Critères d'acceptation** :
- Formulaire de publication accessible depuis l'espace vendeur
- Champs obligatoires :
  - Titre (max 100 caractères)
  - Description (min 50 caractères, éditeur WYSIWYG)
  - Catégorie (sélection dans la liste admin)
  - Prix (en euros, avec 2 décimales)
  - État de l'objet (neuf/excellent/bon/correct)
  - Au moins 3 photos (format JPG/PNG, max 5 Mo chacune)
- Champs optionnels :
  - Frais de port (sinon "à définir avec l'acheteur")
  - Mots-clés (tags)
  - Vidéo de présentation (URL YouTube/Vimeo)
- Affectation à une boutique virtuelle (création possible à la volée)
- Brouillon sauvegardable avant publication
- Soumission pour validation admin (statut "En attente")
- Notification au vendeur une fois validé ou rejeté

**Règles de validation** :
- Photos obligatoires (minimum 3)
- Description non vide et sans coordonnées personnelles détectables (regex)
- Prix > 0 et < 100 000 €
- Catégorie existante dans le référentiel

---

#### FR-CAT-004 : Validation des articles (Admin)
**Priorité** : Haute  
**Description** : Un administrateur doit valider manuellement ou automatiquement les articles avant leur mise en ligne.

**Critères d'acceptation** :
- Interface de modération avec liste des articles "En attente"
- Informations affichées :
  - Aperçu de l'article (comme fiche produit)
  - Historique du vendeur (nb ventes, évaluations)
  - Flags automatiques éventuels (mots interdits détectés, prix aberrant)
- Actions possibles :
  - Valider (article publié immédiatement)
  - Rejeter (avec motif obligatoire, notification vendeur)
  - Demander des modifications (commentaire, article repasse en brouillon)
- Validation automatique possible si :
  - Vendeur a un score de confiance élevé (> 4.5/5 sur 20 ventes)
  - Aucun flag automatique levé
  - Catégorie à faible risque

**Règles métier** :
- Un article peut rester maximum 48h en attente (SLA de modération)
- Au-delà, notification automatique à l'équipe admin
- Traçabilité : qui a validé/rejeté et quand

---

#### FR-CAT-005 : Modification d'un article (Vendeur)
**Priorité** : Moyenne  
**Description** : Un vendeur doit pouvoir modifier un article publié.

**Critères d'acceptation** :
- Édition possible depuis l'espace vendeur → "Mes articles"
- Champs modifiables :
  - Titre, description, photos
  - **Prix** (historique conservé automatiquement)
  - Frais de port
  - État de l'objet
- Champs non modifiables :
  - Catégorie (nécessite suppression + nouvelle publication)
  - Nombre de vues, date de création
- Si modification du prix :
  - Historique enregistré (prix précédent, date, nouveau prix)
  - Notification envoyée aux acheteurs ayant mis l'article en favori
  - Notification envoyée au système de détection de fraudes
- Revalidation admin non nécessaire sauf si changement de catégorie ou signalement

---

#### FR-CAT-006 : Suppression d'un article
**Priorité** : Moyenne  
**Description** : Un vendeur ou un admin doit pouvoir supprimer un article.

**Critères d'acceptation** :
- **Par le vendeur** :
  - Possible uniquement si article non vendu
  - Confirmation obligatoire ("Êtes-vous sûr ?")
  - Suppression définitive (ou archivage selon choix technique)
- **Par l'admin** :
  - Possible à tout moment
  - Motif obligatoire (non-conformité, signalement, etc.)
  - Notification automatique au vendeur
  - En cas de récidive, suspension possible du compte vendeur

---

### 5.3 Gestion des boutiques virtuelles

#### FR-SHOP-001 : Création de boutiques (Vendeur)
**Priorité** : Moyenne  
**Description** : Un vendeur doit pouvoir créer plusieurs boutiques thématiques pour organiser ses articles.

**Critères d'acceptation** :
- Interface de gestion des boutiques dans l'espace vendeur
- Création d'une boutique :
  - Nom de la boutique (unique pour ce vendeur)
  - Description (optionnelle)
  - Bannière/logo (optionnel)
  - Catégorie principale (suggère des tags)
- Un vendeur peut avoir jusqu'à 10 boutiques (limite configurable)
- Chaque article doit être affecté à une boutique
- Boutique "Par défaut" créée automatiquement à la première vente

**Affichage public** :
- Page boutique accessible via le profil vendeur
- Liste de tous les articles de cette boutique
- Statistiques publiques (nombre d'articles, note moyenne)

---

#### FR-SHOP-002 : Gestion de la visibilité du vendeur
**Priorité** : Basse  
**Description** : Un vendeur particulier doit être clairement identifié comme tel (pas de boutique "pro").

**Critères d'acceptation** :
- Badge "Vendeur particulier" visible sur toutes les fiches produits
- Mention légale : "Collector.shop interdit la vente professionnelle"
- Si détection de comportement pro (volume élevé), investigation admin

---

### 5.4 Transactions et paiement

#### FR-PAY-001 : Processus d'achat
**Priorité** : Haute  
**Description** : Un acheteur authentifié doit pouvoir acheter un article via la plateforme.

**Critères d'acceptation** :
- Clic sur "Acheter maintenant" → page de paiement sécurisée
- Récapitulatif affiché :
  - Article (titre, prix, photo miniature)
  - Frais de port
  - Commission Collector (5%, affichée ou incluse dans le prix vendeur)
  - Total TTC
- Choix de l'adresse de livraison (parmi celles enregistrées ou saisie nouvelle)
- **Paiement par carte bancaire uniquement (V1)** :
  - Intégration d'une passerelle de paiement sécurisée (Stripe, Adyen, etc.)
  - Saisie des coordonnées CB (champs tokenisés, PCI-DSS compliant)
  - Option "Enregistrer cette carte pour les prochains achats"
  - 3D Secure obligatoire (SCA, réglementation européenne)
- Confirmation de la commande :
  - Notification in-app et email à l'acheteur
  - Notification au vendeur (nouvel achat à expédier)
  - Mise à jour du statut de l'article → "Vendu"

**Règles de sécurité** :
- Aucun paiement direct entre acheteur et vendeur autorisé
- Toutes les transactions tracées en base de données
- Timeout de session de paiement : 15 minutes

---

#### FR-PAY-002 : Gestion des commandes (Acheteur)
**Priorité** : Moyenne  
**Description** : Un acheteur doit pouvoir suivre ses commandes en cours et passées.

**Critères d'acceptation** :
- Onglet "Mes achats" dans l'espace personnel
- Affichage des commandes avec statuts :
  - "Paiement validé"
  - "En préparation" (vendeur notifié)
  - "Expédiée" (numéro de suivi si fourni par vendeur)
  - "Livrée" (confirmation manuelle ou automatique après 7 jours)
  - "Litige" (si signalement)
- Pour chaque commande :
  - Détails de l'article
  - Date d'achat
  - Montant payé
  - Adresse de livraison
  - Bouton "Contacter le vendeur" (ouvre le chat)
  - Bouton "Signaler un problème" (après réception)
- Une fois "Livrée", possibilité de noter le vendeur (étoiles + commentaire)

---

#### FR-PAY-003 : Gestion des ventes (Vendeur)
**Priorité** : Moyenne  
**Description** : Un vendeur doit pouvoir suivre ses ventes et recevoir ses paiements.

**Critères d'acceptation** :
- Onglet "Mes ventes" dans l'espace vendeur
- Affichage des ventes avec statuts :
  - "Nouvelle vente" (notification reçue)
  - "À expédier" (action requise)
  - "Expédiée" (numéro de suivi saisi)
  - "Finalisée" (acheteur a confirmé réception)
  - "En litige" (si signalement acheteur)
- Pour chaque vente :
  - Détails de l'article vendu
  - Prix de vente et commission prélevée
  - Montant net à recevoir
  - Coordonnées de livraison de l'acheteur
  - Bouton "Marquer comme expédiée" (+ saisie tracking)
  - Bouton "Contacter l'acheteur"
- Paiement au vendeur :
  - Versement automatique J+7 après confirmation de livraison
  - Virement sur compte bancaire enregistré (IBAN SEPA)
  - Possibilité de conserver un solde sur la plateforme pour futurs achats

---

#### FR-PAY-004 : Détection de fraudes (Système)
**Priorité** : Haute  
**Description** : Le système doit détecter automatiquement les comportements suspects et alerter les admins.

**Critères d'acceptation** :
- Détection automatique des signaux d'alerte :
  - Prix aberrant (> 10 000 € ou variation > 50% en moins de 24h)
  - Vendeur avec plusieurs signalements
  - Même utilisateur créant plusieurs comptes (détection IP, empreinte navigateur)
  - Tentative d'échange de coordonnées dans le chat (regex email, téléphone)
  - Volume de ventes anormalement élevé (seuil configurable)
- Envoi d'une notification au composant de détection de fraudes (interne ou externe)
- Alerte dans le tableau de bord admin avec priorité (haute, moyenne, faible)
- Actions possibles :
  - Investigation manuelle
  - Suspension temporaire de l'article ou du compte
  - Demande de justificatifs au vendeur

**Intégration V2** :
- Machine learning pour affiner les critères de détection
- Score de confiance par vendeur (basé sur historique)

---

### 5.5 Système de messagerie (Chat)

#### FR-CHAT-001 : Chat entre acheteur et vendeur
**Priorité** : Haute  
**Description** : Les acheteurs et vendeurs doivent pouvoir échanger via un système de messagerie interne.

**Critères d'acceptation** :
- Interface de chat accessible depuis :
  - Fiche produit (bouton "Contacter le vendeur")
  - Espace personnel (onglet "Messages")
  - Notification de nouveau message
- Fonctionnalités :
  - Envoi de messages texte (max 500 caractères)
  - Envoi de photos (pour questions sur l'état de l'objet, max 2 Mo)
  - Historique complet des conversations conservé
  - Indicateur "en ligne" / "dernière connexion"
  - Notification temps réel (WebSocket ou polling)
- Conversations organisées par article :
  - Un fil de discussion par article/acheteur
  - Titre du fil = nom de l'article + pseudonyme de l'interlocuteur
- Filtre anti-coordonnées personnelles :
  - Détection automatique d'emails (regex)
  - Détection de numéros de téléphone (regex)
  - Message d'avertissement + remplacement par "[INFORMATION MASQUÉE]"
  - Signalement automatique à l'admin en cas de récidive

**Règles de modération** :
- Admin peut consulter l'historique de toutes les conversations
- Utilisateurs peuvent signaler un message inapproprié
- Blocage possible d'un utilisateur (ne peut plus contacter)

---

#### FR-CHAT-002 : Modération du chat (Admin)
**Priorité** : Moyenne  
**Description** : Les administrateurs doivent pouvoir surveiller et modérer les conversations.

**Critères d'acceptation** :
- Interface admin "Modération des messages"
- Affichage des conversations signalées en priorité
- Recherche par utilisateur, article, ou mot-clé
- Actions possibles :
  - Lire l'historique complet d'une conversation
  - Supprimer un message spécifique (avec motif)
  - Avertir un utilisateur (notification + email)
  - Suspendre temporairement l'accès au chat
  - Bannir définitivement en cas de récidive grave
- Log de toutes les actions de modération (traçabilité)

---

### 5.6 Notifications

#### FR-NOTIF-001 : Système de notifications
**Priorité** : Haute  
**Description** : Les utilisateurs doivent recevoir des notifications personnalisées sur différents canaux.

**Critères d'acceptation** :
- **Notifications in-app** :
  - Badge sur l'icône de notification (compteur)
  - Centre de notifications accessible via le menu utilisateur
  - Liste des notifications avec dates, icônes, et actions rapides
  - Marquage comme "lu" / "non lu"
  - Suppression individuelle ou en masse
- **Notifications par email** :
  - Envoi automatique pour les événements critiques
  - Template responsive (design cohérent avec la plateforme)
  - Lien de désinscription en bas de chaque email
- **Préférences de notification** :
  - Page de paramétrage dans l'espace utilisateur
  - Choix du canal (in-app, email, les deux, aucun) pour chaque type d'événement
  - Fréquence (instantané, quotidien, hebdomadaire) pour certains types

**Types de notifications** :
| Événement | Destinataire | In-app | Email | Priorité |
|-----------|--------------|--------|-------|----------|
| Nouvel article correspondant aux centres d'intérêt | Acheteur | ✅ | ✅ (si activé) | Moyenne |
| Article en favori disponible | Acheteur | ✅ | ✅ | Haute |
| Changement de prix (article en favori) | Acheteur | ✅ | ✅ | Haute |
| Nouveau message dans le chat | Acheteur/Vendeur | ✅ | ✅ (après 30 min sans lecture) | Haute |
| Article vendu (notification vendeur) | Vendeur | ✅ | ✅ | Haute |
| Article acheté (confirmation acheteur) | Acheteur | ✅ | ✅ | Haute |
| Paiement validé | Acheteur | ✅ | ✅ | Haute |
| Article expédié | Acheteur | ✅ | ✅ | Haute |
| Livraison confirmée | Vendeur | ✅ | ✅ | Moyenne |
| Nouvelle évaluation reçue | Vendeur | ✅ | ✅ (si activé) | Basse |
| Article validé par admin | Vendeur | ✅ | ✅ | Moyenne |
| Article rejeté par admin | Vendeur | ✅ | ✅ | Haute |
| Compte suspendu | Utilisateur | ✅ | ✅ | Critique |

---

#### FR-NOTIF-002 : Notifications personnalisées
**Priorité** : Moyenne  
**Description** : Un acheteur doit pouvoir s'abonner à des notifications spécifiques.

**Critères d'acceptation** :
- Abonnement possible :
  - À un vendeur spécifique (alerte sur ses nouvelles publications)
  - À une catégorie d'objets
  - À un mot-clé personnalisé (ex: "Jordan", "Star Wars")
- Interface de gestion "Mes abonnements" :
  - Liste des abonnements actifs
  - Possibilité de désactiver temporairement ou supprimer
- Notifications envoyées selon les préférences utilisateur (in-app + email)

---

### 5.7 Recommandations personnalisées

#### FR-RECO-001 : Moteur de recommandation (V1)
**Priorité** : Moyenne  
**Description** : Un acheteur authentifié doit recevoir des recommandations d'articles basées sur ses centres d'intérêt.

**Critères d'acceptation** :
- Bloc "Recommandations pour vous" affiché sur :
  - Page d'accueil (après connexion)
  - Espace personnel
- Algorithme de recommandation basé sur :
  - Centres d'intérêt paramétrés par l'utilisateur
  - Catégories des articles mis en favoris
  - Historique des achats passés
- Affichage de 10 à 20 articles suggérés (carousel ou grille)
- Rafraîchissement quotidien des recommandations
- Bouton "Ne plus recommander cet article" (feedback pour améliorer l'algo)

**Évolution V2** :
- Intégration du parcours de navigation (articles consultés, durée de visite)
- Algorithme collaboratif ("Les utilisateurs qui ont aimé X ont aussi aimé Y")

---

### 5.8 Évaluations et avis

#### FR-EVAL-001 : Notation des vendeurs
**Priorité** : Moyenne  
**Description** : Un acheteur doit pouvoir évaluer un vendeur après réception de sa commande.

**Critères d'acceptation** :
- Possibilité de noter après marquage de la commande comme "Livrée"
- Formulaire d'évaluation :
  - Note globale (1 à 5 étoiles, obligatoire)
  - Critères détaillés (optionnels) :
    - Qualité de l'objet (conforme à la description ?)
    - Communication (réactivité, politesse)
    - Emballage et expédition (délai, soin)
  - Commentaire textuel (max 500 caractères, optionnel)
- Publication immédiate de l'évaluation sur le profil vendeur
- Notification au vendeur (avec lien vers l'évaluation)
- Impossibilité de modifier une évaluation après publication
- Possibilité de signaler une évaluation abusive (investigation admin)

**Affichage des évaluations** :
- Note moyenne du vendeur affichée sur :
  - Fiches produits
  - Profil vendeur
  - Résultats de recherche (badge "4.8/5")
- Page dédiée "Évaluations" sur le profil vendeur :
  - Liste de toutes les évaluations (tri par date ou note)
  - Statistiques (% de 5 étoiles, 4 étoiles, etc.)
  - Filtrage possible (ex: uniquement les 1 étoile)

---

#### FR-EVAL-002 : Réponse du vendeur aux évaluations
**Priorité** : Basse  
**Description** : Un vendeur doit pouvoir répondre publiquement à une évaluation reçue.

**Critères d'acceptation** :
- Une seule réponse possible par évaluation
- Réponse textuelle (max 300 caractères)
- Publication immédiate sous l'évaluation
- Notification à l'acheteur qui a laissé l'évaluation

---

### 5.9 Administration et back-office

#### FR-ADMIN-001 : Gestion des catégories
**Priorité** : Haute  
**Description** : Les administrateurs doivent pouvoir créer et organiser les catégories d'objets.

**Critères d'acceptation** :
- Interface de gestion des catégories (hiérarchique, type arbre)
- Actions possibles :
  - Créer une catégorie (nom, description, icône)
  - Créer une sous-catégorie (ex: "Baskets" > "Nike Air Jordan")
  - Modifier une catégorie existante
  - Supprimer une catégorie (si aucun article associé)
  - Réorganiser l'ordre d'affichage (drag & drop)
- Impact immédiat sur la navigation du site
- Log des modifications (qui, quand, quoi)

---

#### FR-ADMIN-002 : Tableau de bord administrateur
**Priorité** : Moyenne  
**Description** : Les administrateurs doivent avoir une vue d'ensemble de l'activité de la plateforme.

**Critères d'acceptation** :
- Dashboard avec KPIs :
  - Nombre d'utilisateurs inscrits (total, nouveaux cette semaine)
  - Nombre d'articles en ligne (par statut: actif, vendu, en attente)
  - Chiffre d'affaires généré (commissions Collector)
  - Nombre de transactions (jour, semaine, mois)
  - Taux de conversion (visiteurs → acheteurs)
- Graphiques d'évolution temporelle (ligne, barres)
- Alertes remontées en haut du dashboard :
  - Articles en attente de validation (> 48h)
  - Signalements non traités
  - Détections de fraudes en attente
- Accès rapide aux fonctions de modération

---

#### FR-ADMIN-003 : Gestion des utilisateurs
**Priorité** : Moyenne  
**Description** : Les administrateurs doivent pouvoir rechercher, consulter et gérer les comptes utilisateurs.

**Critères d'acceptation** :
- Interface de recherche d'utilisateurs :
  - Par email, pseudonyme, ID
  - Par type (acheteur, vendeur, admin)
  - Par statut (actif, suspendu, banni)
- Consultation d'un profil utilisateur (lecture seule) :
  - Informations personnelles (avec masquage des données sensibles selon RGPD)
  - Historique d'activité (achats, ventes, connexions)
  - Évaluations reçues/données
  - Messages signalés
  - Log des sanctions éventuelles
- Actions possibles :
  - Suspendre temporairement (avec durée et motif)
  - Bannir définitivement (suppression compte + anonymisation RGPD)
  - Envoyer un message d'avertissement
  - Réinitialiser le mot de passe (si demande utilisateur)
  - Supprimer un article spécifique de cet utilisateur

**Règles RGPD** :
- Anonymisation des données à la suppression (remplacement par "Utilisateur supprimé")
- Conservation des transactions pour comptabilité (7 ans légaux)

---

#### FR-ADMIN-004 : Gestion des signalements
**Priorité** : Haute  
**Description** : Les administrateurs doivent traiter les signalements des utilisateurs.

**Critères d'acceptation** :
- Interface "Signalements" avec queue de traitement
- Types de signalements :
  - Article non conforme (photos trompeuses, description mensongère)
  - Vendeur suspect (prix aberrant, comportement frauduleux)
  - Message inapproprié dans le chat (insulte, spam)
  - Évaluation abusive (diffamation, hors sujet)
- Pour chaque signalement :
  - Détails du contenu signalé (avec contexte)
  - Utilisateur ayant signalé (pseudonyme)
  - Date du signalement
  - Statut (nouveau, en cours, traité)
- Actions possibles :
  - Approuver le signalement → sanction (suppression contenu, avertissement, suspension)
  - Rejeter le signalement (non fondé) → notification au signalant
  - Demander plus d'informations (via message)
- SLA de traitement : 72h maximum
- Traçabilité complète (admin ayant traité, décision, date)

---

### 5.10 Accessibilité et internationalisation

#### FR-I18N-001 : Support multilingue
**Priorité** : Moyenne (V1: Français, V2: Anglais, Espagnol)  
**Description** : La plateforme doit supporter plusieurs langues.

**Critères d'acceptation** :
- Sélecteur de langue dans le header (drapeau + libellé)
- Langues disponibles V1 :
  - Français (par défaut)
- Langues prévues V2 :
  - Anglais, Espagnol
- Traduction de l'interface :
  - Menus, boutons, labels de formulaires
  - Messages d'erreur et de succès
  - Emails automatiques (templates multilingues)
- Contenu utilisateur non traduit :
  - Descriptions d'articles (rédigées par vendeurs)
  - Messages du chat
  - Évaluations
- Détection automatique de la langue du navigateur au premier accès
- Enregistrement de la préférence utilisateur en base

---

#### FR-I18N-002 : Gestion des devises
**Priorité** : Basse (V2)  
**Description** : La plateforme doit supporter plusieurs devises pour l'internationalisation.

**Critères d'acceptation** :
- V1 : Euro (€) uniquement
- V2 : Conversion automatique en USD, GBP, CHF (taux de change API externe)
- Affichage du symbole de la devise selon la locale de l'utilisateur
- Paiement en devise locale (via passerelle de paiement)

---

#### FR-ACCESS-001 : Conformité WCAG 2.1 (Niveau AA)
**Priorité** : Haute  
**Description** : La plateforme doit être accessible aux personnes en situation de handicap.

**Critères d'acceptation** :
- **Navigation au clavier** :
  - Tous les éléments interactifs accessibles via Tab
  - Indicateurs de focus visibles (outline)
  - Raccourcis clavier pour actions principales (optionnel)
- **Lecteurs d'écran** :
  - Structure HTML sémantique (balises appropriées)
  - Attributs ARIA sur composants dynamiques
  - Textes alternatifs sur toutes les images (alt)
  - Labels explicites sur formulaires
- **Contrastes de couleurs** :
  - Ratio minimum 4.5:1 pour texte normal (WCAG AA)
  - Ratio 3:1 pour texte large (> 18pt)
  - Outil de vérification automatique lors du développement
- **Redimensionnement** :
  - Zoom jusqu'à 200% sans perte de fonctionnalité
  - Design responsive (mobile, tablette, desktop)
- **Contenus multimédias** :
  - Sous-titres sur vidéos (si implémentées V2)
  - Transcriptions textuelles disponibles
- **Tests d'accessibilité** :
  - Audit automatique (Lighthouse, Axe)
  - Tests manuels avec lecteurs d'écran (NVDA, JAWS)
  - Tests utilisateurs avec personnes en situation de handicap (optionnel)

---

## 6. Exigences non fonctionnelles

### 6.1 Performance

#### NFR-PERF-001 : Temps de chargement
**Description** : La plateforme doit offrir des temps de réponse rapides.

**Critères d'acceptation** :
- Page d'accueil : < 2 secondes (First Contentful Paint)
- Fiche produit : < 1,5 secondes
- Résultats de recherche : < 2 secondes (max 100 résultats par page)
- Chargement du chat : < 1 seconde (WebSocket)
- API backend : temps de réponse < 500 ms (95e percentile)

**Mesures** :
- Monitoring en production (New Relic, Datadog, ou équivalent)
- Alertes si dégradation > 20% du baseline
- Tests de charge réguliers (JMeter, Gatling)

---

#### NFR-PERF-002 : Scalabilité
**Description** : La plateforme doit supporter une montée en charge progressive.

**Critères d'acceptation** :
- Charge attendue V1 :
  - 1 000 utilisateurs actifs simultanés
  - 10 000 articles en ligne
  - 500 transactions/jour
- Charge cible V2 (1 an) :
  - 10 000 utilisateurs actifs simultanés
  - 100 000 articles
  - 2 000 transactions/jour
- Architecture distribuée (microservices ou modulaire)
- Auto-scaling sur l'infrastructure cloud (Kubernetes, ECS, etc.)
- Base de données optimisée (indexation, réplication, cache Redis/Memcached)

---

#### NFR-PERF-003 : Disponibilité
**Description** : La plateforme doit être disponible 24/7 avec un uptime élevé.

**Critères d'acceptation** :
- Objectif : 99,5% d'uptime (équivalent à ~3,6 heures de downtime/mois)
- Fenêtre de maintenance planifiée : dimanche 2h-5h (notification 7 jours avant)
- Plan de reprise d'activité (PRA) :
  - Backup quotidien de la base de données (rétention 30 jours)
  - Backup incrémental toutes les 6 heures
  - Test de restauration trimestriel
- Monitoring 24/7 avec alertes automatiques (SMS, PagerDuty)

---

### 6.2 Sécurité

#### NFR-SEC-001 : Authentification et gestion des sessions
**Description** : La plateforme doit protéger les comptes utilisateurs contre les accès non autorisés.

**Critères d'acceptation** :
- Hashage des mots de passe (bcrypt, Argon2)
- Politique de mot de passe forte (min 8 caractères, complexité)
- Rate limiting sur les tentatives de connexion (5 essais / 15 min)
- Blocage temporaire après 5 échecs consécutifs (30 min)
- Sessions sécurisées :
  - Cookies HttpOnly, Secure, SameSite=Lax
  - Tokens JWT avec expiration (24h)
  - Refresh tokens (30 jours, révocables)
- Déconnexion automatique après 24h d'inactivité
- Authentification multi-facteurs (2FA) optionnelle (V2)

---

#### NFR-SEC-002 : Chiffrement des données
**Description** : Les données sensibles doivent être chiffrées au repos et en transit.

**Critères d'acceptation** :
- **En transit** :
  - HTTPS obligatoire sur toutes les pages (certificat TLS 1.3)
  - HSTS activé (Strict-Transport-Security)
  - Redirection automatique HTTP → HTTPS
- **Au repos** :
  - Chiffrement de la base de données (AES-256)
  - Tokenisation des cartes bancaires (via passerelle de paiement)
  - Pas de stockage de données bancaires sensibles (PCI-DSS)
  - Chiffrement des backups

---

#### NFR-SEC-003 : Protection contre les attaques courantes
**Description** : La plateforme doit être protégée contre les vulnérabilités OWASP Top 10.

**Critères d'acceptation** :
- **Injection SQL** : Requêtes paramétrées / ORM
- **XSS** : Échappement de toutes les sorties utilisateur, CSP (Content Security Policy)
- **CSRF** : Tokens CSRF sur tous les formulaires
- **Authentification cassée** : Voir NFR-SEC-001
- **Exposition de données sensibles** : Voir NFR-SEC-002
- **Contrôle d'accès défaillant** : RBAC (Role-Based Access Control)
- **Mauvaise configuration** : Audits de sécurité réguliers (Nessus, OpenVAS)
- **XSS côté serveur** : Validation stricte des fichiers uploadés (images)
- **Désérialisation non sécurisée** : Validation des payloads JSON
- **Composants vulnérables** : Scan automatique des dépendances (Snyk, Dependabot)

**Audits de sécurité** :
- Pentests avant chaque déploiement majeur
- Scan automatique quotidien des vulnérabilités (SAST/DAST)
- Bug bounty program (V2)

---

#### NFR-SEC-004 : Conformité RGPD
**Description** : La plateforme doit respecter le Règlement Général sur la Protection des Données.

**Critères d'acceptation** :
- Consentement explicite lors de l'inscription (case à cocher)
- Droit d'accès : export des données personnelles (format JSON/PDF)
- Droit de rectification : modification du profil
- Droit à l'effacement : suppression de compte avec anonymisation
- Droit à la portabilité : export des données structurées
- Droit d'opposition : désinscription des notifications marketing
- Politique de confidentialité accessible et claire
- DPO (Data Protection Officer) désigné
- Registre des traitements (conformité article 30)
- Notification CNIL en cas de fuite de données (< 72h)

---

### 6.3 Maintenabilité et évolutivité

#### NFR-MAINT-001 : Qualité du code
**Description** : Le code doit être maintenable et respecter les bonnes pratiques.

**Critères d'acceptation** :
- Standards de codage (PSR pour PHP, PEP8 pour Python, etc.)
- Couverture de tests :
  - Tests unitaires : > 80%
  - Tests d'intégration : > 60%
  - Tests end-to-end : scénarios critiques (achat, paiement, chat)
- Revue de code obligatoire (minimum 1 reviewer)
- Analyse statique du code (SonarQube, ESLint)
- Documentation technique :
  - Architecture globale (diagrammes)
  - README par module/service
  - Documentation API (Swagger/OpenAPI)
  - Commentaires sur code complexe

---

#### NFR-MAINT-002 : Architecture modulaire
**Description** : L'architecture doit permettre l'ajout de nouvelles fonctionnalités sans refonte majeure.

**Critères d'acceptation** :
- Architecture en microservices ou modulaire (modules découplés)
- API RESTful ou GraphQL pour communication inter-services
- Contrats d'interface clairs (OpenAPI, protobuf)
- Gestion des versions d'API (v1, v2, etc.)
- Feature flags pour déploiements progressifs (LaunchDarkly, ou custom)

---

#### NFR-MAINT-003 : Monitoring et observabilité
**Description** : La plateforme doit être monitorée pour détecter rapidement les incidents.

**Critères d'acceptation** :
- Logs centralisés (ELK Stack, Splunk, ou équivalent)
- Métriques applicatives :
  - Temps de réponse par endpoint
  - Taux d'erreur (4xx, 5xx)
  - Nombre de requêtes/seconde
- Métriques infrastructure :
  - CPU, RAM, disque
  - Latence réseau
- Tracing distribué (Jaeger, Zipkin) pour débugger les requêtes lentes
- Alertes configurées sur seuils critiques (Prometheus + Grafana)
- Dashboards temps réel accessibles aux équipes ops et dev

---

### 6.4 Utilisabilité (UX/UI)

#### NFR-UX-001 : Interface intuitive
**Description** : L'interface doit être simple d'utilisation pour tous les profils d'utilisateurs.

**Critères d'acceptation** :
- Design responsive (mobile-first)
- Navigation cohérente (menu persistant)
- Appels à l'action (CTA) visibles et explicites
- Messages d'erreur clairs et constructifs ("Votre mot de passe doit contenir..." au lieu de "Erreur")
- Feedback immédiat sur les actions (loaders, messages de succès)
- Parcours d'achat en maximum 3 clics (article → panier → paiement)
- Tests utilisateurs avant chaque release majeure (minimum 5 utilisateurs)

---

#### NFR-UX-002 : Compatibilité navigateurs et appareils
**Description** : La plateforme doit fonctionner sur les navigateurs et appareils les plus courants.

**Critères d'acceptation** :
- Navigateurs supportés (2 dernières versions majeures) :
  - Chrome, Firefox, Safari, Edge
- Appareils :
  - Desktop (Windows, macOS, Linux)
  - Mobile (iOS 14+, Android 10+)
  - Tablettes (iPad, Android)
- Progressive Web App (PWA) optionnelle (V2) :
  - Installation sur écran d'accueil
  - Fonctionnement offline limité (cache des pages consultées)

---

### 6.5 Conformité légale

#### NFR-LEGAL-001 : Conformité e-commerce
**Description** : La plateforme doit respecter la législation française et européenne sur le e-commerce.

**Critères d'acceptation** :
- Mentions légales complètes (éditeur, hébergeur, contact)
- CGV (Conditions Générales de Vente) accessibles
- CGU (Conditions Générales d'Utilisation) acceptées à l'inscription
- Droit de rétractation (14 jours pour acheteur particulier, non applicable entre particuliers mais information claire)
- Facturation automatique après chaque transaction
- Affichage du prix TTC (Toutes Taxes Comprises)
- Information claire sur les frais de port
- Médiation de la consommation (lien vers médiateur)

---

#### NFR-LEGAL-002 : Lutte contre le blanchiment (LCB-FT)
**Description** : En tant qu'intermédiaire financier (encaissement des paiements), Collector doit se conformer aux obligations LCB-FT.

**Critères d'acceptation** :
- Identification des utilisateurs (KYC : Know Your Customer) :
  - Collecte de pièce d'identité pour vendeurs dès le premier seuil (> 150 € de ventes)
  - Vérification automatique via service tiers (Onfido, Jumio, etc.)
- Déclaration des transactions suspectes (Tracfin) si détection :
  - Volume anormal de ventes
  - Montants élevés inhabituels
  - Comportement incohérent
- Conservation des données 5 ans (obligation légale)
- Formation de l'équipe admin aux signaux d'alerte

---

## 7. Règles métier

### RM-001 : Paiements centralisés uniquement
**Description** : Tout paiement doit obligatoirement transiter par la plateforme.  
**Justification** : Garantir la traçabilité, percevoir la commission, et protéger les utilisateurs.  
**Impact** : Filtrage des coordonnées personnelles dans le chat, interdiction des mentions de paiement externe.

---

### RM-002 : Commission de 5% sur chaque transaction
**Description** : Collector prélève 5% du prix de vente HT.  
**Calcul** : Commission = Prix de vente × 0,05  
**Exemple** : Article à 100 € → Commission Collector = 5 € → Vendeur reçoit 95 €  
**Application** : Prélèvement automatique avant versement au vendeur.

---

### RM-003 : Validation des articles avant publication
**Description** : Un article ne peut être visible publiquement qu'après validation admin (manuelle ou automatisée).  
**Exceptions** :  
- Vendeurs de confiance (score > 4.5/5 sur 20+ ventes) → validation automatique  
- Catégories à faible risque (ex: "Livres") → validation allégée

---

### RM-004 : Interdiction de vente professionnelle
**Description** : Collector est réservé aux ventes entre particuliers.  
**Détection** :  
- Si un utilisateur vend plus de 50 articles/mois → investigation admin  
- Si SIRET mentionné dans description → rejet automatique  
**Sanction** : Suspension du compte après avertissement.

---

### RM-005 : Conservation des historiques de prix
**Description** : Toute modification de prix est enregistrée avec timestamp.  
**Justification** : Détecter les manipulations frauduleuses, transparence pour acheteurs.  
**Affichage** : Historique visible sur la fiche produit (optionnel selon choix UX).

---

### RM-006 : Délai de versement au vendeur
**Description** : Le vendeur reçoit son paiement 7 jours après confirmation de livraison par l'acheteur.  
**Justification** : Période de sécurité pour traiter d'éventuels litiges.  
**Exception** : Si aucune confirmation après 7 jours, versement automatique (présomption de bonne livraison).

---

### RM-007 : Limite d'articles en vente simultanée (par vendeur)
**Description** : Un vendeur peut avoir maximum 100 articles actifs simultanément (configurable).  
**Justification** : Éviter les comptes "grossistes" déguisés en particuliers.  
**Contournement possible** : Augmentation de la limite sur demande motivée (investigation admin).

---

### RM-008 : Durée de vie d'une annonce
**Description** : Un article non vendu expire après 90 jours.  
**Action** : Article archivé automatiquement, notification au vendeur.  
**Réactivation** : Possible manuellement (compte comme nouvelle publication).

---

## 8. Cas d'usage détaillés

### CU-001 : Inscription d'un nouvel utilisateur

**Acteur principal** : Visiteur  
**Déclencheur** : Clic sur "S'inscrire"  
**Préconditions** : Aucune  
**Postconditions** : Compte créé, email de confirmation envoyé

**Scénario nominal** :
1. Le visiteur clique sur "S'inscrire" dans le header
2. Le système affiche le formulaire d'inscription
3. Le visiteur remplit les champs :
   - Email : jean.dupont@example.com
   - Pseudonyme : JeanCollector93
   - Mot de passe : MotDePa$$e123
   - Confirmation mot de passe : MotDePa$$e123
   - Case CGU : cochée
   - Case consentement RGPD : cochée
4. Le visiteur clique sur "Créer mon compte"
5. Le système valide les données :
   - Email au format valide ✅
   - Email non déjà utilisé ✅
   - Mot de passe conforme ✅
   - CGU acceptées ✅
6. Le système crée le compte avec statut "Email non validé"
7. Le système envoie un email de confirmation avec lien unique
8. Le système affiche : "Votre compte a été créé ! Consultez vos emails pour activer votre compte."
9. Le visiteur clique sur le lien dans l'email
10. Le système valide l'email et change le statut en "Actif"
11. Le système redirige vers la page de connexion

**Scénarios alternatifs** :

**5a. Email déjà utilisé**
- Le système affiche : "Cette adresse email est déjà associée à un compte. [Mot de passe oublié ?]"
- Retour à l'étape 3

**5b. Mot de passe non conforme**
- Le système affiche : "Votre mot de passe doit contenir au moins 8 caractères, dont 1 majuscule, 1 chiffre, et 1 caractère spécial."
- Retour à l'étape 3

**5c. CGU non acceptées**
- Le bouton "Créer mon compte" est désactivé
- Message : "Vous devez accepter les Conditions Générales d'Utilisation"

**10a. Lien de confirmation expiré (> 24h)**
- Le système affiche : "Ce lien a expiré. [Renvoyer un email de confirmation]"
- L'utilisateur peut demander un nouveau lien

---

### CU-002 : Publication d'un article par un vendeur

**Acteur principal** : Vendeur authentifié  
**Déclencheur** : Clic sur "Vendre un article"  
**Préconditions** : Utilisateur connecté  
**Postconditions** : Article créé avec statut "En attente de validation"

**Scénario nominal** :
1. Le vendeur accède à son espace personnel
2. Le vendeur clique sur "Vendre un article"
3. Le système affiche le formulaire de publication
4. Le vendeur remplit les informations :
   - Titre : "Figurine Star Wars Boba Fett 1980 Kenner"
   - Catégorie : Jouets > Figurines > Star Wars
   - Description : "Figurine originale Kenner 1980, état excellent, emballage d'origine conservé..."
   - Prix : 150 €
   - État : Excellent
   - Photos : 4 photos uploadées (face, dos, détail, emballage)
   - Frais de port : 8 €
   - Boutique : "Ma collection Star Wars"
5. Le vendeur clique sur "Publier"
6. Le système valide les données :
   - Titre non vide ✅
   - 4 photos (≥ 3 requis) ✅
   - Description > 50 caractères ✅
   - Prix > 0 ✅
   - Aucune coordonnée personnelle détectée ✅
7. Le système enregistre l'article avec statut "En attente"
8. Le système envoie une notification au vendeur : "Votre article est en cours de validation. Vous serez notifié sous 48h."
9. Le système notifie l'équipe admin (nouveau article à modérer)

**Scénarios alternatifs** :

**6a. Photos insuffisantes (< 3)**
- Le système affiche : "Vous devez ajouter au moins 3 photos de votre article."
- Retour à l'étape 4

**6b. Coordonnées personnelles détectées dans la description**
- Le système affiche : "Votre description contient des coordonnées personnelles (email, téléphone). Veuillez les retirer pour respecter les règles de la plateforme."
- Les coordonnées sont surlignées en rouge
- Retour à l'étape 4

**6c. Prix aberrant (> 10 000 €)**
- Le système affiche : "Le prix saisi semble anormalement élevé. Êtes-vous sûr ?"
- Le vendeur confirme ou corrige
- Flag "Prix suspect" ajouté pour revue admin prioritaire

**7a. Vendeur de confiance (score > 4.5/5, 20+ ventes)**
- L'article est directement publié (statut "Actif")
- Notification : "Votre article est en ligne !"
- Envoi de notifications aux acheteurs intéressés par cette catégorie

---

### CU-003 : Achat d'un article par un acheteur

**Acteur principal** : Acheteur authentifié  
**Acteurs secondaires** : Système de paiement, Vendeur  
**Déclencheur** : Clic sur "Acheter maintenant"  
**Préconditions** : Utilisateur connecté, article disponible  
**Postconditions** : Transaction enregistrée, article marqué "Vendu", notifications envoyées

**Scénario nominal** :
1. L'acheteur consulte la fiche d'un article (ex: "Figurine Boba Fett" à 150 €)
2. L'acheteur clique sur "Acheter maintenant"
3. Le système affiche la page de paiement avec récapitulatif :
   - Article : Figurine Boba Fett - 150 €
   - Frais de port : 8 €
   - Total : 158 € TTC
4. L'acheteur sélectionne son adresse de livraison (ou en ajoute une nouvelle)
5. L'acheteur saisit ses coordonnées bancaires (formulaire sécurisé Stripe)
6. L'acheteur valide le paiement
7. Le système de paiement demande l'authentification 3D Secure (SMS, app bancaire)
8. L'acheteur valide via son téléphone
9. Le système de paiement retourne "Paiement accepté"
10. Le système Collector :
    - Enregistre la transaction
    - Marque l'article comme "Vendu"
    - Envoie une notification à l'acheteur : "Votre commande est confirmée !"
    - Envoie une notification au vendeur : "Vous avez vendu votre article ! Expédiez-le rapidement."
    - Envoie un email de confirmation avec récapitulatif à l'acheteur
11. Le vendeur reçoit les coordonnées de livraison de l'acheteur
12. Fin du cas d'usage

**Scénarios alternatifs** :

**9a. Paiement refusé (carte invalide, fonds insuffisants, etc.)**
- Le système de paiement retourne "Paiement refusé"
- Le système affiche : "Votre paiement n'a pas pu être effectué. Vérifiez vos coordonnées bancaires."
- Retour à l'étape 5
- Article reste disponible

**9b. Timeout pendant le paiement (> 15 min)**
- Le système annule la transaction
- Message : "Votre session de paiement a expiré. Veuillez recommencer."
- Retour à l'étape 2

**2a. Article déjà vendu (entre-temps, concurrence d'acheteurs)**
- Le système affiche : "Désolé, cet article vient d'être vendu."
- Proposition d'articles similaires
- Fin du cas d'usage

---

### CU-004 : Conversation dans le chat entre acheteur et vendeur

**Acteur principal** : Acheteur  
**Acteur secondaire** : Vendeur, Système de détection  
**Déclencheur** : Clic sur "Contacter le vendeur"  
**Préconditions** : Utilisateur authentifié  
**Postconditions** : Messages échangés, historique conservé

**Scénario nominal** :
1. L'acheteur consulte la fiche d'un article
2. L'acheteur clique sur "Contacter le vendeur"
3. Le système ouvre l'interface de chat
4. L'acheteur rédige un message : "Bonjour, est-ce que la figurine est en bon état ? Pouvez-vous m'envoyer une photo du dos ?"
5. L'acheteur clique sur "Envoyer"
6. Le système valide le message (aucune coordonnée détectée)
7. Le système enregistre le message dans la conversation
8. Le système notifie le vendeur (notification in-app + email si pas de lecture après 30 min)
9. Le vendeur se connecte et ouvre le chat
10. Le vendeur répond : "Bonjour ! Oui, elle est en très bon état. Je vous envoie une photo supplémentaire."
11. Le vendeur joint une photo (upload d'image)
12. Le vendeur clique sur "Envoyer"
13. Le système enregistre le message + photo
14. L'acheteur reçoit la notification et consulte la réponse
15. L'acheteur décide d'acheter l'article (fin du cas d'usage)

**Scénarios alternatifs** :

**6a. Coordonnées personnelles détectées dans le message**
- L'acheteur écrit : "Bonjour, voici mon email : jean@example.com, contactez-moi directement"
- Le système détecte l'email (regex)
- Le système affiche : "Votre message contient des informations personnelles interdites. Les paiements doivent se faire via la plateforme pour votre sécurité."
- Le message est remplacé par : "Bonjour, voici mon email : [INFORMATION MASQUÉE], contactez-moi directement"
- Le système enregistre un signalement automatique (log pour admin)
- Le message est tout de même envoyé (avec masquage)
- En cas de récidive (3 fois), avertissement automatique à l'utilisateur

**11a. Image trop volumineuse (> 2 Mo)**
- Le système affiche : "L'image est trop volumineuse. La taille maximale est de 2 Mo."
- Retour à l'étape 10

**14a. L'acheteur signale un message inapproprié (insulte, spam)**
- L'acheteur clique sur "Signaler ce message"
- Le système demande le motif (menu déroulant)
- Le système enregistre le signalement et notifie l'admin
- L'acheteur peut bloquer le vendeur (ne peut plus le contacter)

---

### CU-005 : Modération d'un article par un administrateur

**Acteur principal** : Administrateur  
**Déclencheur** : Nouvel article en attente de validation  
**Préconditions** : Administrateur connecté  
**Postconditions** : Article validé ou rejeté, vendeur notifié

**Scénario nominal** :
1. L'admin accède au tableau de bord
2. L'admin voit une alerte : "5 articles en attente de validation"
3. L'admin clique sur "Modération des articles"
4. Le système affiche la liste des articles "En attente" (tri par ancienneté)
5. L'admin clique sur le premier article : "Figurine Boba Fett"
6. Le système affiche :
   - Aperçu complet de l'article (comme fiche produit)
   - Informations vendeur : JeanCollector93, membre depuis 2 mois, 3 ventes, note 4.8/5
   - Flags automatiques : Aucun
7. L'admin vérifie :
   - Photos conformes (non trompeuses) ✅
   - Description claire et honnête ✅
   - Prix cohérent (comparaison avec prix du marché) ✅
   - Catégorie correcte ✅
8. L'admin clique sur "Valider"
9. Le système change le statut de l'article en "Actif"
10. Le système publie l'article sur la plateforme
11. Le système envoie une notification au vendeur : "Bonne nouvelle ! Votre article a été validé et est maintenant en ligne."
12. Le système envoie des notifications aux acheteurs intéressés par cette catégorie
13. Fin du cas d'usage

**Scénarios alternatifs** :

**7a. Photos trompeuses (ne correspondent pas à la description)**
- L'admin clique sur "Rejeter"
- Le système demande le motif (texte libre)
- L'admin écrit : "Les photos ne correspondent pas à la description. L'emballage semble endommagé contrairement à ce qui est indiqué."
- Le système change le statut en "Rejeté"
- Le système notifie le vendeur avec le motif
- Le vendeur peut corriger et resoumettre

**7b. Prix aberrant (détecté manuellement)**
- Prix : 15 000 € pour une figurine standard
- L'admin clique sur "Demander des modifications"
- L'admin écrit : "Le prix semble anormalement élevé. Pouvez-vous justifier cette valorisation ou corriger ?"
- Le système renvoie l'article en statut "Brouillon" chez le vendeur
- Le vendeur reçoit la notification et peut modifier

**7c. Contenu suspect (réplique, contrefaçon possible)**
- L'admin clique sur "Signaler pour investigation"
- Le système crée un ticket admin prioritaire
- L'article reste "En attente" jusqu'à décision
- Demande éventuelle de justificatifs au vendeur (facture d'achat, certificat d'authenticité)

---

## 9. User Stories

### Epic 1 : Gestion des utilisateurs

**US-001** : En tant que **visiteur**, je veux **créer un compte** afin de **pouvoir acheter et vendre des objets**.  
_Critères d'acceptation_ : Voir CU-001  
_Priorité_ : Haute

**US-002** : En tant qu'**utilisateur**, je veux **me connecter avec mon email et mot de passe** afin d'**accéder à mon espace personnel**.  
_Priorité_ : Haute

**US-003** : En tant qu'**utilisateur**, je veux **modifier mes informations personnelles** afin de **maintenir mon profil à jour**.  
_Priorité_ : Moyenne

**US-004** : En tant qu'**utilisateur**, je veux **supprimer mon compte** afin de **ne plus apparaître sur la plateforme** (conformité RGPD).  
_Priorité_ : Basse

---

### Epic 2 : Gestion du catalogue

**US-005** : En tant que **visiteur**, je veux **parcourir le catalogue d'objets** afin de **découvrir ce qui est disponible**.  
_Priorité_ : Haute

**US-006** : En tant que **visiteur**, je veux **rechercher un article par mot-clé** afin de **trouver rapidement ce qui m'intéresse**.  
_Priorité_ : Haute

**US-007** : En tant que **visiteur**, je veux **filtrer les résultats par prix, catégorie, et état** afin de **affiner ma recherche**.  
_Priorité_ : Moyenne

**US-008** : En tant qu'**acheteur**, je veux **ajouter un article à mes favoris** afin de **le retrouver facilement plus tard**.  
_Priorité_ : Basse

**US-009** : En tant que **vendeur**, je veux **publier un article à vendre** afin de **gagner de l'argent en vendant mes objets**.  
_Critères d'acceptation_ : Voir CU-002  
_Priorité_ : Haute

**US-010** : En tant que **vendeur**, je veux **modifier le prix de mon article** afin de **m'adapter au marché**.  
_Priorité_ : Moyenne

---

### Epic 3 : Transactions

**US-011** : En tant qu'**acheteur**, je veux **acheter un article via la plateforme** afin de **sécuriser ma transaction**.  
_Critères d'acceptation_ : Voir CU-003  
_Priorité_ : Haute

**US-012** : En tant qu'**acheteur**, je veux **suivre l'état de ma commande** afin de **savoir quand elle sera livrée**.  
_Priorité_ : Moyenne

**US-013** : En tant que **vendeur**, je veux **recevoir les coordonnées de livraison de l'acheteur** afin de **pouvoir expédier l'article**.  
_Priorité_ : Haute

**US-014** : En tant que **vendeur**, je veux **recevoir mon paiement 7 jours après la livraison** afin de **sécuriser la transaction**.  
_Priorité_ : Haute

---

### Epic 4 : Communication

**US-015** : En tant qu'**acheteur**, je veux **contacter le vendeur via un chat** afin de **poser des questions sur l'article**.  
_Critères d'acceptation_ : Voir CU-004  
_Priorité_ : Haute

**US-016** : En tant qu'**utilisateur**, je veux **recevoir des notifications sur les événements importants** afin de **rester informé**.  
_Priorité_ : Haute

**US-017** : En tant qu'**acheteur**, je veux **paramétrer mes préférences de notification** afin de **ne recevoir que ce qui m'intéresse**.  
_Priorité_ : Basse

---

### Epic 5 : Recommandations et personnalisation

**US-018** : En tant qu'**acheteur**, je veux **recevoir des recommandations d'articles personnalisées** afin de **découvrir des objets qui pourraient m'intéresser**.  
_Priorité_ : Moyenne

**US-019** : En tant qu'**acheteur**, je veux **définir mes centres d'intérêt** afin de **recevoir des recommandations pertinentes**.  
_Priorité_ : Basse

---

### Epic 6 : Évaluations

**US-020** : En tant qu'**acheteur**, je veux **noter un vendeur après un achat** afin de **partager mon expérience avec la communauté**.  
_Priorité_ : Moyenne

**US-021** : En tant qu'**acheteur**, je veux **consulter les évaluations d'un vendeur avant d'acheter** afin de **m'assurer de sa fiabilité**.  
_Priorité_ : Moyenne

**US-022** : En tant que **vendeur**, je veux **répondre publiquement à une évaluation** afin de **clarifier un malentendu ou remercier l'acheteur**.  
_Priorité_ : Basse

---

### Epic 7 : Administration

**US-023** : En tant qu'**admin**, je veux **valider ou rejeter les articles en attente** afin de **garantir la qualité du catalogue**.  
_Critères d'acceptation_ : Voir CU-005  
_Priorité_ : Haute

**US-024** : En tant qu'**admin**, je veux **créer et organiser les catégories d'objets** afin de **structurer le catalogue**.  
_Priorité_ : Haute

**US-025** : En tant qu'**admin**, je veux **consulter le tableau de bord avec les KPIs de la plateforme** afin de **suivre l'activité**.  
_Priorité_ : Moyenne

**US-026** : En tant qu'**admin**, je veux **modérer les conversations du chat** afin de **faire respecter les règles de la plateforme**.  
_Priorité_ : Moyenne

**US-027** : En tant qu'**admin**, je veux **suspendre un utilisateur en cas de comportement frauduleux** afin de **protéger la communauté**.  
_Priorité_ : Haute

---

### Epic 8 : Sécurité et fraude

**US-028** : En tant que **système**, je veux **détecter automatiquement les tentatives d'échange de coordonnées personnelles** afin de **protéger les transactions**.  
_Priorité_ : Haute

**US-029** : En tant que **système**, je veux **détecter les prix aberrants et comportements suspects** afin de **alerter les admins**.  
_Priorité_ : Haute

**US-030** : En tant qu'**admin**, je veux **recevoir des alertes sur les transactions suspectes** afin de **investiguer rapidement**.  
_Priorité_ : Haute

---

## 10. Glossaire

| Terme | Définition |
|-------|------------|
| **Acheteur** | Utilisateur inscrit souhaitant acquérir des objets de collection sur la plateforme. |
| **Administrateur (Admin)** | Utilisateur ayant des droits de gestion et modération sur la plateforme. |
| **API** | Application Programming Interface - Interface de programmation permettant la communication entre services. |
| **Boutique virtuelle** | Espace thématique créé par un vendeur pour regrouper ses articles. |
| **Chat** | Système de messagerie instantanée intégré permettant les échanges entre acheteurs et vendeurs. |
| **CI/CD** | Continuous Integration / Continuous Deployment - Pratique DevOps d'automatisation du build, test et déploiement. |
| **Commission** | Pourcentage prélevé par Collector sur chaque transaction (5% du prix de vente). |
| **DevSecOps** | Pratique intégrant la sécurité dans le cycle DevOps dès les phases de développement. |
| **Fiche produit** | Page détaillée présentant un article (photos, description, prix, vendeur, etc.). |
| **Flag** | Marqueur automatique signalant un élément potentiellement problématique (prix aberrant, mot interdit, etc.). |
| **JWT** | JSON Web Token - Standard de token sécurisé pour l'authentification. |
| **KPI** | Key Performance Indicator - Indicateur clé de performance (nombre d'utilisateurs, CA, etc.). |
| **Marketplace** | Plateforme de vente mettant en relation acheteurs et vendeurs (Collector.shop). |
| **PCI-DSS** | Payment Card Industry Data Security Standard - Norme de sécurité pour le traitement des cartes bancaires. |
| **RGPD** | Règlement Général sur la Protection des Données - Cadre légal européen sur les données personnelles. |
| **SLA** | Service Level Agreement - Engagement de niveau de service (ex: modération sous 48h). |
| **Uptime** | Pourcentage de temps durant lequel un service est disponible (ex: 99,5%). |
| **Vendeur** | Utilisateur inscrit mettant en vente ses objets de collection. |
| **Visiteur** | Internaute non authentifié naviguant sur la plateforme. |
| **WCAG** | Web Content Accessibility Guidelines - Directives d'accessibilité web du W3C. |

---

## Historique des versions

| Version | Date | Auteur | Modifications |
|---------|------|--------|---------------|
| 1.0 | 21/11/2025 | Équipe Projet | Création initiale du document de spécifications fonctionnelles détaillées |

---

**Fin du document**
