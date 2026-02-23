#!/bin/bash
# ===========================================
# Deploy Collector.shop on K3s
# ===========================================
# 1. Remplis les vraies valeurs dans 01-secrets.yaml AVANT de lancer ce script
# 2. Lance depuis le VPS : bash deploy.sh
# ===========================================

set -e

echo "🚀 Deploying Collector.shop..."

kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-secrets.yaml
kubectl apply -f 02-configmap.yaml
kubectl apply -f 03-postgres.yaml
kubectl apply -f 04-redis.yaml
kubectl apply -f 05-minio.yaml
kubectl apply -f 06-backend.yaml
kubectl apply -f 07-frontend.yaml
kubectl apply -f 08-ingress.yaml

echo ""
echo "⏳ Waiting for pods to be ready..."
kubectl rollout status deployment/postgres -n collector-prod
kubectl rollout status deployment/redis -n collector-prod
kubectl rollout status deployment/backend -n collector-prod
kubectl rollout status deployment/frontend -n collector-prod

echo ""
echo "✅ Done! Pods running:"
kubectl get pods -n collector-prod

echo ""
echo "🌐 Ingress:"
kubectl get ingress -n collector-prod
