# Frontend Dockerfile for Collector.shop

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for Vite build)
RUN npm ci

# Copy source code
COPY src ./src
COPY index.html ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY vite.config.ts ./
COPY .eslintrc.cjs ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the app
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Create non-root user for nginx
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001 -G nginx-user

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files from builder with read-only permissions
COPY --from=builder --chown=root:root /app/dist /usr/share/nginx/html

# Set permissions for nginx directories (nginx needs to write to these)
RUN chown -R nginx-user:nginx-user /var/cache/nginx /var/run /var/log/nginx && \
    chmod -R 755 /var/cache/nginx /var/run /var/log/nginx && \
    chmod -R 555 /usr/share/nginx/html

# Switch to non-root user
USER nginx-user

# Expose port (use 8080 for non-root user)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
