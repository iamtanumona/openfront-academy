import { describe, expect, it } from 'vitest';
import { HealthResponseSchema } from './index';

describe('health response', () => {
  it('accepts a valid response', () => {
    expect(HealthResponseSchema.safeParse({ status: 'ok', service: 'openfront-api', version: '0.1.0' }).success).toBe(true);
  });
});
