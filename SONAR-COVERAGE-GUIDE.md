# SonarQube Coverage - Test Files Exclusion

## Pourquoi les fichiers de test affichent 0% de coverage?

### C'est normal et attendu!

Les fichiers de test (`*.test.ts`, `*.test.tsx`) affichent **0.0% de coverage** dans SonarQube car:

1. **Les fichiers de test ne doivent jamais être inclus dans les métriques de couverture**
   - La couverture de code mesure le % de **code de production** testé
   - Les tests ne testent pas les tests - c'est logiquement impossible

2. **SonarQube signale les test files comme "uncovered" par défaut**
   - C'est parce qu'aucune ligne de test n'est "couverte" par les tests
   - Cela montre que les fichiers de test ne contribuent pas à la métrique de couverture

3. **Configuration correcte = exclure les tests du rapport**
   - Voir `sonar-project.properties` et `.sonarcloud.yml` pour les exclusions

## Fichiers exclu de l'analyse SonarQube

### Patterns exclus:
```
**/*.test.ts
**/*.test.tsx
**/*.spec.ts
**/*.spec.tsx
**/tests/**
**/__tests__/**
```

### Fichiers de configuration exclu:
```
*.config.js
*.config.ts
.eslintrc.cjs
vite.config.ts
vitest.config.ts
tsconfig.json
tailwind.config.js
postcss.config.js
```

### Dossiers exclu:
```
**/node_modules/**
**/dist/**
**/coverage/**
```

## Résultat esperé

Après configuration:
- ✅ Les fichiers de test n'apparaîtront PAS dans le rapport "Uncovered Lines"
- ✅ La couverture mesurera SEULEMENT le code de production
- ✅ Les métriques de qualité seront plus pertinentes

## Vérification

Pour vérifier que les exclusions fonctionnent:

1. **Dans SonarQube/SonarCloud UI:**
   - Aller dans Project Settings → Analysis Scope
   - Vérifier que les test files sont exclus

2. **Avec sonar-scanner:**
   ```bash
   sonar-scanner -Dsonar.projectKey=collector-shop \
                 -Dsonar.sources=frontend/src,backend/src \
                 -Dsonar.exclusions='**/*.test.ts,**/*.test.tsx,**/tests/**,**/__tests__/**'
   ```

3. **Rapport de couverture:**
   - Les fichiers `*.test.ts` et `*.test.tsx` ne doivent PAS apparaître
   - Seul le code source (`frontend/src/`, `backend/src/`) doit être analysé

## Conclusion

Avoir 0% de coverage sur les fichiers de test est **correct et souhaité**. 
Cela garantit que:
- Les métriques de couverture mesurent vraiment le code de production
- Les tests ne gonflent pas artificiellement les chiffres
- La qualité du code source est le vrai focus
