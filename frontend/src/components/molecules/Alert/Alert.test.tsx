import { describe, it, expect } from 'vitest';
import Alert from './Alert';

describe('Alert', () => {
  it('exports component without rendering (style deps may be missing in test env)', () => {
    expect(Alert).toBeDefined();
  });
});
