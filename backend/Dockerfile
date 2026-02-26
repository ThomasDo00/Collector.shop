# Backend Dockerfile for Collector.shop

# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace manifests so npm can resolve all workspaces from root
COPY package.json package-lock.json ./
COPY backend/package.json  ./backend/package.json
COPY frontend/package.json ./frontend/package.json

# Install all workspace dependencies from the monorepo root
# (packages are hoisted to /app/node_modules; non-hoistable ones go to
#  /app/backend/node_modules — we need both in production)
RUN npm ci

# Copy backend source and build
COPY backend/ ./backend/

WORKDIR /app/backend

RUN npm run build

# ── Production stage ─────────────────────────────────────────────────────────
FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy hoisted packages (the majority)
COPY --from=builder /app/node_modules ./node_modules

WORKDIR /app/backend

# Copy workspace-specific packages (non-hoisted backend deps)
COPY --from=builder /app/backend/node_modules ./node_modules

# Copy source code (needed for migrations/seeds with tsx)
COPY --from=builder /app/backend/src ./src

# Copy built files
COPY --from=builder /app/backend/dist ./dist

# Use non-root user for security
RUN chown -R node:node /app
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start with dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
