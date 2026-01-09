#!/bin/bash

set -e  # Exit on error

echo "🧪 Test complet de la CI/CD..."
echo ""
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
echo "🐳 Vérification de Docker..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker n'est pas lancé${NC}"
    echo "Lancez Docker et réessayez."
    exit 1
fi
echo -e "${GREEN}✅ Docker est lancé${NC}"
echo ""

# Check if services are running
echo "🔍 Vérification des services..."
if ! docker compose ps | grep -q "Up"; then
    echo -e "${YELLOW}⚠️  Services Docker non lancés${NC}"
    echo "Lancement des services..."
    npm run docker:up
    sleep 5
fi
echo -e "${GREEN}✅ Services lancés${NC}"
echo ""

# 1. Install dependencies
echo "📦 Installation des dépendances..."
if [ ! -d "node_modules" ]; then
    npm install
fi
echo -e "${GREEN}✅ Dépendances installées${NC}"
echo ""

# 2. Lint
echo "📝 Linting du code..."
echo "   - Backend..."
npm run lint:backend --silent
echo "   - Frontend..."
npm run lint:frontend --silent
echo -e "${GREEN}✅ Lint passed${NC}"
echo ""

# 3. Tests
echo "🧪 Exécution des tests..."
echo "   - Backend tests..."
npm run test:backend --silent
echo "   - Frontend tests..."
npm run test:frontend --silent
echo -e "${GREEN}✅ Tests passed${NC}"
echo ""

# 4. Coverage
echo "📊 Vérification de la couverture..."
echo "   - Backend coverage..."
npm run test:coverage -w backend --silent > /dev/null 2>&1 || true
BACKEND_COV=$(cat backend/coverage/coverage-summary.json 2>/dev/null | grep -o '"pct":[0-9.]*' | head -1 | grep -o '[0-9.]*' || echo "0")
echo "      Couverture: ${BACKEND_COV}%"

echo "   - Frontend coverage..."
npm run test:coverage -w frontend --silent > /dev/null 2>&1 || true
FRONTEND_COV=$(cat frontend/coverage/coverage-summary.json 2>/dev/null | grep -o '"pct":[0-9.]*' | head -1 | grep -o '[0-9.]*' || echo "0")
echo "      Couverture: ${FRONTEND_COV}%"

if (( $(echo "$BACKEND_COV < 80" | bc -l) )) || (( $(echo "$FRONTEND_COV < 80" | bc -l) )); then
    echo -e "${YELLOW}⚠️  Attention: Couverture < 80%${NC}"
else
    echo -e "${GREEN}✅ Couverture OK${NC}"
fi
echo ""

# 5. Build
echo "🔨 Build du projet..."
echo "   - Backend..."
npm run build:backend --silent
echo "   - Frontend..."
npm run build:frontend --silent
echo -e "${GREEN}✅ Build successful${NC}"
echo ""

echo "================================================"
echo ""
echo -e "${GREEN}✨ Tous les tests sont passés !${NC}"
echo ""
echo "📋 Résumé:"
echo "   ✅ Lint: OK"
echo "   ✅ Tests: OK"
echo "   ✅ Build: OK"
echo "   📊 Coverage Backend: ${BACKEND_COV}%"
echo "   📊 Coverage Frontend: ${FRONTEND_COV}%"
echo ""
echo "🚀 Vous pouvez maintenant push sur GitHub !"
echo ""
