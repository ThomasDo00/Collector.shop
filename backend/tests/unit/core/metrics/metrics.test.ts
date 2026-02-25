import { describe, it, expect, vi } from 'vitest';

// Mock prom-client before importing the metrics module.
// Each metric constructor returns a controllable object.
vi.mock('prom-client', () => {
  const mockRegistry = {
    setDefaultLabels: vi.fn(),
    contentType: 'text/plain; version=0.0.4',
    metrics: vi.fn().mockResolvedValue('# TYPE test counter\n'),
  };
  return {
    Registry: vi.fn().mockReturnValue(mockRegistry),
    collectDefaultMetrics: vi.fn(),
    Counter: vi.fn().mockReturnValue({ inc: vi.fn() }),
    Histogram: vi.fn().mockReturnValue({ observe: vi.fn() }),
    Gauge: vi.fn().mockReturnValue({ inc: vi.fn(), dec: vi.fn(), set: vi.fn() }),
  };
});

import {
  register,
  httpRequestDuration,
  httpRequestsTotal,
  httpActiveRequests,
  registeredUsers,
  activeProducts,
} from '../../../../src/core/metrics/index.js';

describe('metrics module', () => {
  it('exports a registry with a metrics() method', async () => {
    expect(register).toBeDefined();
    const output = await register.metrics();
    expect(typeof output).toBe('string');
  });

  it('exports httpRequestDuration histogram', () => {
    expect(httpRequestDuration).toBeDefined();
    expect(typeof httpRequestDuration.observe).toBe('function');
  });

  it('exports httpRequestsTotal counter', () => {
    expect(httpRequestsTotal).toBeDefined();
    expect(typeof httpRequestsTotal.inc).toBe('function');
  });

  it('exports httpActiveRequests gauge', () => {
    expect(httpActiveRequests).toBeDefined();
    expect(typeof httpActiveRequests.inc).toBe('function');
    expect(typeof httpActiveRequests.dec).toBe('function');
  });

  it('exports registeredUsers gauge', () => {
    expect(registeredUsers).toBeDefined();
    expect(typeof registeredUsers.set).toBe('function');
  });

  it('exports activeProducts gauge', () => {
    expect(activeProducts).toBeDefined();
    expect(typeof activeProducts.set).toBe('function');
  });

  it('metrics can be incremented/observed without throwing', () => {
    expect(() => httpRequestsTotal.inc({ method: 'GET', route: '/', status_code: '200' })).not.toThrow();
    expect(() => httpActiveRequests.inc()).not.toThrow();
    expect(() => httpActiveRequests.dec()).not.toThrow();
    expect(() => httpRequestDuration.observe({ method: 'GET', route: '/', status_code: '200' }, 0.1)).not.toThrow();
  });
});
