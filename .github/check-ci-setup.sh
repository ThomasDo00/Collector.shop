#!/bin/bash

echo "🔍 Vérification de la configuration CI/CD..."
echo ""

# Check workflows
echo "📋 Workflows GitHub Actions:"
if [ -d ".github/workflows" ]; then
  ls -1 .github/workflows/*.yml | while read file; do
    echo "  ✅ $(basename $file)"
  done
else
  echo "  ❌ Dossier .github/workflows introuvable"
  exit 1
fi

echo ""

# Check package.json scripts
echo "📦 Scripts NPM:"
REQUIRED_SCRIPTS=("test" "lint" "build" "test:backend" "test:frontend" "lint:backend" "lint:frontend" "build:backend" "build:frontend")

for script in "${REQUIRED_SCRIPTS[@]}"; do
  if grep -q "\"$script\"" package.json; then
    echo "  ✅ $script"
  else
    echo "  ❌ $script (manquant)"
  fi
done

echo ""

# Check .env configuration
echo "🔐 Configuration .env:"
if [ -f ".env" ]; then
  REQUIRED_VARS=("DATABASE_URL" "REDIS_URL" "JWT_SECRET" "API_PORT")
  
  for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^$var=" .env; then
      echo "  ✅ $var"
    else
      echo "  ⚠️  $var (manquant ou commenté)"
    fi
  done
else
  echo "  ⚠️  Fichier .env introuvable"
fi

echo ""

# Check if git is initialized
echo "📂 Git:"
if [ -d ".git" ]; then
  echo "  ✅ Repository Git initialisé"
  
  if git remote -v | grep -q "origin"; then
    echo "  ✅ Remote 'origin' configuré"
    git remote get-url origin
  else
    echo "  ⚠️  Remote 'origin' non configuré"
  fi
else
  echo "  ❌ Git non initialisé"
fi

echo ""
echo "✨ Vérification terminée!"
echo ""
echo "📚 Pour plus d'informations, consultez : .github/CICD.md"
