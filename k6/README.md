# k6 Performance Tests — Collector.shop

Load and performance tests for the Collector.shop marketplace API, written with [k6](https://k6.io/).

## Prerequisites

Install k6 on your machine:

```bash
# macOS
brew install k6

# Ubuntu / Debian
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 \
  --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6

# Windows (Chocolatey)
choco install k6
```

## Environment Variables

| Variable            | Default                          | Description                            |
|---------------------|----------------------------------|----------------------------------------|
| `BASE_URL`          | `https://collector-shop.online`  | Target API base URL                    |
| `LOAD_TEST_PASSWORD`| `LoadTest123!`                   | Password for the pre-seeded load-test user |

## Running the tests

All tests target the production URL by default. Override with `BASE_URL` for local or staging runs.

### Smoke test

Minimal check — 1 VU, 30 seconds. Verifies that the API is up and responding.

```bash
k6 run k6/smoke-test.js

# Against a different environment
k6 run -e BASE_URL=http://localhost:3000 k6/smoke-test.js
```

### Load test

Simulates normal to peak traffic (0→10→20 VUs over ~8 minutes) across the catalog browse and category listing scenarios.

```bash
k6 run k6/load-test.js

# Save a summary report
k6 run --summary-export=k6/results/load-summary.json k6/load-test.js
```

### Stress test

Pushes the catalog endpoint to its breaking point (0→100 VUs over ~9 minutes). Includes custom `Trend` and `Rate` metrics.

```bash
k6 run k6/stress-test.js
```

### Auth flow test

Simulates authenticated users: login → browse products → view product detail (5 VUs, 2 minutes). Requires the pre-seeded load-test account to exist in the target environment.

```bash
k6 run k6/auth-flow-test.js

# Use a custom password
k6 run -e LOAD_TEST_PASSWORD=MySecret k6/auth-flow-test.js
```

## What each test does

| File                  | Purpose                                                                              |
|-----------------------|--------------------------------------------------------------------------------------|
| `smoke-test.js`       | Sanity check — 1 VU / 30 s, hits `/health`, `/products`, `/categories`             |
| `load-test.js`        | Normal + peak traffic simulation with random catalog filters and product detail calls |
| `stress-test.js`      | Finds the system breaking point by ramping up to 100 concurrent users               |
| `auth-flow-test.js`   | Validates authenticated user flow: login → token reuse → product browsing            |
