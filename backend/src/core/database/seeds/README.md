# Database Seeds

Ce dossier contient les **seeds** (données de test) pour la base de données.

## Pourquoi des seeds?

Dans un projet collaboratif, les seeds permettent à tous les développeurs d'avoir **les mêmes données de test** dans leur base de données locale. Cela garantit:

- ✅ Cohérence entre les environnements de dev
- ✅ Tests fonctionnels reproductibles
- ✅ Démonstrations avec des données réalistes
- ✅ Onboarding facile des nouveaux développeurs

## Utilisation

### Insérer les données de test

```bash
# Depuis la racine du projet
npm run db:seed

# Depuis le dossier backend
npm run seed
```

### Reset complet (migrations + seeds)

```bash
# 1. Rollback toutes les migrations
npm run db:rollback

# 2. Re-exécuter les migrations
npm run db:migrate

# 3. Insérer les données de test
npm run db:seed
```

## Données de test disponibles

### Users (01_seed_users.ts)

| Email | Username | Role | Password | Status |
|-------|----------|------|----------|--------|
| buyer1@collector.shop | sneaker_hunter | buyer | Test123!@# | active |
| seller1@collector.shop | vintage_collector | seller | Test123!@# | active |
| admin@collector.shop | admin | admin | Test123!@# | active |
| buyer2@collector.shop | poster_lover | buyer | Test123!@# | active |
| seller2@collector.shop | retro_gamer | seller | Test123!@# | active |
| pending@collector.shop | new_user | buyer | Test123!@# | pending |

**Tous les utilisateurs ont le même mot de passe: `Test123!@#`**

## Ordre d'exécution

Les seeds sont exécutés par ordre alphabétique du nom de fichier. C'est pourquoi on utilise des préfixes numériques:

- `01_seed_users.ts` - Données utilisateurs (exécuté en premier)
- `02_seed_categories.ts` - Catégories (à créer si nécessaire)
- `03_seed_products.ts` - Produits (à créer si nécessaire)

## Ajouter un nouveau seed

1. Créer un fichier `XX_seed_<table>.ts` (XX = numéro d'ordre)
2. Exporter une fonction `seed(knex: Knex)`
3. Utiliser `await knex('<table>').del()` pour nettoyer
4. Utiliser `await knex('<table>').insert([...])` pour insérer

Exemple:

```typescript
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('categories').del();

  await knex('categories').insert([
    { id: 1, name: 'Sneakers', slug: 'sneakers' },
    { id: 2, name: 'Posters', slug: 'posters' },
  ]);

  console.log('✅ Categories seeded');
}
```

## Environnements

- **Development**: Seeds activés (données de test)
- **Test**: Seeds activés (données de test pour CI/CD)
- **Production**: Seeds DÉSACTIVÉS (jamais de seeds en prod!)

## Sécurité

⚠️ **IMPORTANT**:
- Ne JAMAIS mettre de vraies données utilisateur dans les seeds
- Ne JAMAIS commiter de mots de passe réels
- Les seeds sont UNIQUEMENT pour le développement et les tests
