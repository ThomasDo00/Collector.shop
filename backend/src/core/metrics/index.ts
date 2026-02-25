import { Registry, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

export const register = new Registry();

register.setDefaultLabels({ app: 'collector-backend' });

// Default Node.js metrics (CPU, memory, event loop, GC, etc.)
collectDefaultMetrics({ register });

// HTTP request duration histogram
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

// HTTP request counter
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Active HTTP connections
export const httpActiveRequests = new Gauge({
  name: 'http_active_requests',
  help: 'Number of active HTTP requests',
  registers: [register],
});

// Business metrics
export const registeredUsers = new Gauge({
  name: 'collector_registered_users_total',
  help: 'Total number of registered users',
  registers: [register],
});

export const activeProducts = new Gauge({
  name: 'collector_active_products_total',
  help: 'Total number of active product listings',
  registers: [register],
});
