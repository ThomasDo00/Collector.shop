import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'https://collector-shop.online';

// Custom metrics
const catalogResponseTime = new Trend('catalog_response_time', true);
const catalogSuccessRate = new Rate('catalog_success_rate');

export const options = {
  stages: [
    { duration: '1m', target: 10 },   // ramp-up
    { duration: '2m', target: 50 },   // increase load
    { duration: '2m', target: 100 },  // approach breaking point
    { duration: '3m', target: 100 },  // hold at peak
    { duration: '1m', target: 0 },    // recovery
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.05'],
    catalog_response_time: ['p(95)<2000'],
    catalog_success_rate: ['rate>0.95'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/api/catalog/products`);

  const success = check(res, {
    'stress: products status 200': (r) => r.status === 200,
    'stress: response time < 2s': (r) => r.timings.duration < 2000,
    'stress: has body': (r) => r.body && r.body.length > 0,
  });

  // Record custom metrics
  catalogResponseTime.add(res.timings.duration);
  catalogSuccessRate.add(success ? 1 : 0);

  sleep(0.5);
}
