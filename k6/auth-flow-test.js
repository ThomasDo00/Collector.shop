import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'https://collector-shop.online';
const LOAD_TEST_EMAIL = 'loadtest@collector-shop.online';
const LOAD_TEST_PASSWORD = __ENV.LOAD_TEST_PASSWORD || 'LoadTest123!';

// Custom metrics per endpoint category
const loginDuration = new Trend('login_duration', true);
const apiCallDuration = new Trend('api_call_duration', true);

export const options = {
  vus: 5,
  duration: '2m',
  thresholds: {
    login_duration: ['p(95)<1000'],
    api_call_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  // Step 1: Login
  const loginPayload = JSON.stringify({
    email: LOAD_TEST_EMAIL,
    password: LOAD_TEST_PASSWORD,
  });

  const loginRes = http.post(`${BASE_URL}/api/users/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  loginDuration.add(loginRes.timings.duration);

  const loginOk = check(loginRes, {
    'auth_flow: login status 200': (r) => r.status === 200,
    'auth_flow: login returns token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return !!(body.token || body.accessToken || body.access_token);
      } catch (_) {
        return false;
      }
    },
  });

  if (!loginOk) {
    // Cannot proceed without a valid token
    sleep(1);
    return;
  }

  // Extract JWT token from login response
  let token;
  try {
    const body = JSON.parse(loginRes.body);
    token = body.token || body.accessToken || body.access_token;
  } catch (_) {
    sleep(1);
    return;
  }

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  sleep(0.5);

  // Step 2: Fetch product list (authenticated)
  const productsRes = http.get(`${BASE_URL}/api/catalog/products`, authHeaders);
  apiCallDuration.add(productsRes.timings.duration);

  check(productsRes, {
    'auth_flow: products list status 200': (r) => r.status === 200,
    'auth_flow: products list has body': (r) => r.body && r.body.length > 0,
  });

  // Extract a product ID for the detail call
  let productId = null;
  try {
    const body = JSON.parse(productsRes.body);
    const items = Array.isArray(body) ? body : (body.data || body.items || body.products || []);
    if (items.length > 0) {
      productId = items[Math.floor(Math.random() * items.length)].id;
    }
  } catch (_) {
    // no-op
  }

  sleep(0.5);

  // Step 3: Fetch product detail (authenticated)
  if (productId) {
    const detailRes = http.get(`${BASE_URL}/api/catalog/products/${productId}`, authHeaders);
    apiCallDuration.add(detailRes.timings.duration);

    check(detailRes, {
      'auth_flow: product detail status 200': (r) => r.status === 200,
      'auth_flow: product detail has body': (r) => r.body && r.body.length > 0,
    });
  }

  sleep(1);
}
