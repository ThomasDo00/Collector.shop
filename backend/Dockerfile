# Backend Dockerfile for Collector.shop

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json package-lock.json ./
COPY backend/ ./backend/

WORKDIR /app/backend

# Install ALL dependencies (including devDependencies for TypeScript build)
RUN npm ci

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json package-lock.json ./
COPY backend/tsconfig.json ./

# Copy node_modules from builder (avoids running install scripts in production)
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
