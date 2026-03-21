import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://collector-shop.online';

export const options = {
  stages: [
    { duration: '1m', target: 10 },  // ramp-up to 10 VUs
    { duration: '3m', target: 10 },  // steady at 10 VUs
    { duration: '1m', target: 20 },  // ramp-up to 20 VUs (peak)
    { duration: '2m', target: 20 },  // hold peak
    { duration: '1m', target: 0 },   // ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    http_reqs: ['rate>10'],
  },
};

const CATEGORIES = ['sneakers', 'posters', 'figurines', 'cassettes', 'collectibles'];
const PRICE_RANGES = [
  { min: 0, max: 50 },
  { min: 50, max: 200 },
  { min: 200, max: 500 },
  { min: 500, max: 2000 },
];

// Fetch product IDs once before the test starts, to be reused across VUs
export function setup() {
  const res = http.get(`${BASE_URL}/api/catalog/products`);
  if (res.status !== 200) {
    return { productIds: [] };
  }

  let productIds = [];
  try {
    const body = JSON.parse(res.body);
    // Support both array response and { data: [...] } shape
    const items = Array.isArray(body) ? body : (body.data || body.items || body.products || []);
    productIds = items
      .filter((item) => item && item.id)
      .map((item) => item.id)
      .slice(0, 50); // cap to 50 IDs
  } catch (_) {
    productIds = [];
  }

  return { productIds };
}

export default function (data) {
  const { productIds } = data;

  // Distribute scenarios: 70% browse_catalog, 30% view_categories
  const rand = Math.random();

  if (rand < 0.7) {
    browseCatalog(productIds);
  } else {
    viewCategories();
  }
}

function browseCatalog(productIds) {
  group('browse_catalog', () => {
    // Build random filter query string
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const priceRange = PRICE_RANGES[Math.floor(Math.random() * PRICE_RANGES.length)];
    const params = new URLSearchParams({
      category,
      minPrice: priceRange.min.toString(),
      maxPrice: priceRange.max.toString(),
    });

    const listRes = http.get(`${BASE_URL}/api/catalog/products?${params.toString()}`);
    check(listRes, {
      'browse_catalog: products list status 200': (r) => r.status === 200,
      'browse_catalog: products list has body': (r) => r.body && r.body.length > 0,
    });

    sleep(randomSleep(0.5, 2));

    // Fetch a product detail if IDs are available
    if (productIds && productIds.length > 0) {
      const productId = productIds[Math.floor(Math.random() * productIds.length)];
      const detailRes = http.get(`${BASE_URL}/api/catalog/products/${productId}`);
      check(detailRes, {
        'browse_catalog: product detail status 200 or 404': (r) =>
          r.status === 200 || r.status === 404,
        'browse_catalog: product detail has body': (r) => r.body && r.body.length > 0,
      });

      sleep(randomSleep(0.5, 2));
    }
  });
}

function viewCategories() {
  group('view_categories', () => {
    const res = http.get(`${BASE_URL}/api/catalog/categories`);
    check(res, {
      'view_categories: status 200': (r) => r.status === 200,
      'view_categories: has body': (r) => r.body && r.body.length > 0,
    });

    sleep(randomSleep(0.5, 2));
  });
}

// Returns a random float between min and max (seconds)
function randomSleep(min, max) {
  return min + Math.random() * (max - min);
}
