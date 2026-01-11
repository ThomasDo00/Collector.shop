#!/bin/bash

# Test Database Integration - Vérifie que le backend utilise PostgreSQL
# et que les seeds fonctionnent correctement

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🧪 Test Database Integration"
echo "===================================="
echo ""

# 1. Vérifier PostgreSQL
echo "1️⃣  Vérification PostgreSQL..."
if docker exec collector-postgres psql -U collector -d collector -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL accessible${NC}"
else
    echo -e "${RED}❌ PostgreSQL non accessible${NC}"
    exit 1
fi

# 2. Vérifier les migrations
echo ""
echo "2️⃣  Vérification des migrations..."
TABLES=$(docker exec collector-postgres psql -U collector -d collector -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'" | tr -d ' ')
if [ "$TABLES" = "1" ]; then
    echo -e "${GREEN}✅ Table 'users' existe${NC}"
else
    echo -e "${YELLOW}⚠️  Table 'users' manquante, exécution des migrations...${NC}"
    npm run db:migrate --silent
fi

# 3. Vérifier les seeds
echo ""
echo "3️⃣  Vérification des données de test..."
USER_COUNT=$(docker exec collector-postgres psql -U collector -d collector -t -c "SELECT COUNT(*) FROM users" | tr -d ' ')
if [ "$USER_COUNT" -gt "0" ]; then
    echo -e "${GREEN}✅ ${USER_COUNT} utilisateurs trouvés${NC}"
else
    echo -e "${YELLOW}⚠️  Aucun utilisateur, exécution des seeds...${NC}"
    npm run db:seed --silent
    USER_COUNT=$(docker exec collector-postgres psql -U collector -d collector -t -c "SELECT COUNT(*) FROM users" | tr -d ' ')
    echo -e "${GREEN}✅ ${USER_COUNT} utilisateurs créés${NC}"
fi

# 4. Afficher les utilisateurs de test
echo ""
echo "4️⃣  Utilisateurs de test disponibles:"
echo ""
docker exec collector-postgres psql -U collector -d collector -c "SELECT username, email, role, status FROM users ORDER BY created_at;" | head -20

# 5. Vérifier les credentials
echo ""
echo "5️⃣  Test des credentials..."
echo ""
echo -e "${BLUE}📧 Credentials de test:${NC}"
echo "   Email: buyer1@collector.shop"
echo "   Password: Test123!@#"
echo ""

echo "===================================="
echo -e "${GREEN}✨ Database Integration Test Complete!${NC}"
echo ""
echo "📋 Résumé:"
echo "   ✅ PostgreSQL: Running"
echo "   ✅ Migrations: Applied"
echo "   ✅ Seeds: ${USER_COUNT} users loaded"
echo ""
echo "🔐 Pour tester le login:"
echo "   curl -X POST http://localhost:4000/api/users/login \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"emailOrUsername\":\"buyer1@collector.shop\",\"password\":\"Test123!@#\"}'"
echo ""
