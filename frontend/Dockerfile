# Frontend Dockerfile for Collector.shop

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy monorepo package files (package-lock.json lives at root)
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/

# Install frontend workspace dependencies
# --ignore-scripts prevents postinstall scripts from running (supply-chain safety)
RUN npm ci --workspace=frontend --ignore-scripts

# Copy frontend source code
COPY frontend/src ./frontend/src
COPY frontend/index.html ./frontend/index.html
COPY frontend/tsconfig.json ./frontend/tsconfig.json
COPY frontend/tsconfig.node.json ./frontend/tsconfig.node.json
COPY frontend/vite.config.ts ./frontend/vite.config.ts
COPY frontend/.eslintrc.cjs ./frontend/.eslintrc.cjs
COPY frontend/tailwind.config.js ./frontend/tailwind.config.js
COPY frontend/postcss.config.js ./frontend/postcss.config.js

# Build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the app
WORKDIR /app/frontend
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Configure permissions for non-root nginx user
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown nginx:nginx /var/run/nginx.pid

# Copy custom nginx config
COPY frontend/nginx.conf /etc/nginx/nginx.conf

# Copy built files from builder
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Use non-root user for security
USER nginx

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
