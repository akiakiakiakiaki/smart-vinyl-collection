import { afterEach, describe, expect, it, vi } from 'vitest';
import { CACHE_TTL_MS } from '@/lib/cache/cacheConfig';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('cacheConfig', () => {
  it('uses a positive shared cache TTL', () => {
    expect(CACHE_TTL_MS).toBeGreaterThan(0);
  });

  it('accepts a positive CACHE_TTL_MS environment override', async () => {
    vi.stubEnv('CACHE_TTL_MS', '1234');
    vi.resetModules();

    const config = await import('@/lib/cache/cacheConfig');

    expect(config.CACHE_TTL_MS).toBe(1234);
  });

  it('falls back when CACHE_TTL_MS is invalid', async () => {
    vi.stubEnv('CACHE_TTL_MS', 'not-a-number');
    vi.resetModules();

    const config = await import('@/lib/cache/cacheConfig');

    expect(config.CACHE_TTL_MS).toBe(15 * 60 * 1000);
  });
});
