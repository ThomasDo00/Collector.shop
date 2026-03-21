import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://collector-shop.online';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  // GET /health
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health: status 200': (r) => r.status === 200,
    'health: response time < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(0.5);

  // GET /api/catalog/products
  const productsRes = http.get(`${BASE_URL}/api/catalog/products`);
  check(productsRes, {
    'products: status 200': (r) => r.status === 200,
    'products: has body': (r) => r.body && r.body.length > 0,
    'products: response time < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(0.5);

  // GET /api/catalog/categories
  const categoriesRes = http.get(`${BASE_URL}/api/catalog/categories`);
  check(categoriesRes, {
    'categories: status 200': (r) => r.status === 200,
    'categories: has body': (r) => r.body && r.body.length > 0,
    'categories: response time < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(0.5);
}
