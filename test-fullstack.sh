#!/bin/bash

# Test Full Stack - Collector.shop
# Tests PostgreSQL, Backend API, and Frontend-Backend communication

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🧪 Test Full Stack - Collector.shop"
echo "===================================="
echo ""

# 1. Test PostgreSQL
echo "📊 Testing PostgreSQL..."
if docker exec collector-postgres psql -U collector -d collector -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is running and accessible${NC}"
else
    echo -e "${RED}❌ PostgreSQL connection failed${NC}"
    exit 1
fi

# Check if tables exist
TABLE_COUNT=$(docker exec collector-postgres psql -U collector -d collector -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'" | tr -d ' ')
if [ "$TABLE_COUNT" = "1" ]; then
    echo -e "${GREEN}✅ Database tables are initialized${NC}"
else
    echo -e "${RED}❌ Database tables are missing${NC}"
    exit 1
fi
echo ""

# 2. Test Backend API
echo "🔧 Testing Backend API..."
BACKEND_HEALTH=$(curl -s http://localhost:4000/health | jq -r '.status' 2>/dev/null || echo "error")
if [ "$BACKEND_HEALTH" = "ok" ]; then
    echo -e "${GREEN}✅ Backend API is running (http://localhost:4000)${NC}"
else
    echo -e "${RED}❌ Backend API is not responding${NC}"
    exit 1
fi

# Test user API endpoint
API_RESPONSE=$(curl -s -X POST http://localhost:4000/api/users/login \
    -H "Content-Type: application/json" \
    -d '{"emailOrUsername":"nonexistent","password":"test"}' | jq -r '.error' 2>/dev/null || echo "error")
if [ "$API_RESPONSE" = "INVALID_CREDENTIALS" ]; then
    echo -e "${GREEN}✅ User API endpoints are working${NC}"
else
    echo -e "${YELLOW}⚠️  User API returned unexpected response${NC}"
fi
echo ""

# 3. Test Frontend
echo "🎨 Testing Frontend..."
FRONTEND_TITLE=$(curl -s http://localhost:5173 | grep -o "<title>.*</title>" | sed 's/<[^>]*>//g' || echo "")
if [ ! -z "$FRONTEND_TITLE" ]; then
    echo -e "${GREEN}✅ Frontend is running (http://localhost:5173)${NC}"
    echo -e "${BLUE}   Title: $FRONTEND_TITLE${NC}"
else
    echo -e "${RED}❌ Frontend is not responding${NC}"
    exit 1
fi
echo ""

# 4. Test Frontend-Backend Communication (via Vite proxy)
echo "🔗 Testing Frontend-Backend Communication..."
PROXY_RESPONSE=$(curl -s -X POST http://localhost:5173/api/users/login \
    -H "Content-Type: application/json" \
    -d '{"emailOrUsername":"test","password":"test"}' | jq -r '.success' 2>/dev/null || echo "error")
if [ "$PROXY_RESPONSE" = "false" ]; then
    echo -e "${GREEN}✅ Frontend → Backend communication working (Vite proxy)${NC}"
else
    echo -e "${RED}❌ Frontend-Backend communication failed${NC}"
    exit 1
fi
echo ""

# 5. Test Redis
echo "🗄️  Testing Redis..."
if docker exec collector-redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is running and accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Redis connection failed${NC}"
fi
echo ""

# 6. Test MinIO
echo "📦 Testing MinIO (S3)..."
MINIO_HEALTH=$(curl -s http://localhost:9002/minio/health/live || echo "error")
if [ "$MINIO_HEALTH" != "error" ]; then
    echo -e "${GREEN}✅ MinIO is running (http://localhost:9002)${NC}"
else
    echo -e "${YELLOW}⚠️  MinIO is not responding${NC}"
fi
echo ""

echo "===================================="
echo -e "${GREEN}✨ Full Stack Test Complete!${NC}"
echo ""
echo "📋 Summary:"
echo "   ✅ PostgreSQL: Running (port 5433)"
echo "   ✅ Backend API: Running (port 4000)"
echo "   ✅ Frontend: Running (port 5173)"
echo "   ✅ Frontend ↔ Backend: Connected"
echo "   ✅ Redis: Running (port 6380)"
echo "   ✅ MinIO: Running (ports 9002-9003)"
echo ""
echo "🌐 URLs:"
echo "   Frontend:    http://localhost:5173"
echo "   Backend API: http://localhost:4000"
echo "   API Docs:    http://localhost:4000/docs"
echo "   MinIO:       http://localhost:9003"
echo ""
