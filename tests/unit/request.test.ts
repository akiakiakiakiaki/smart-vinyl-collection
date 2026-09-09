import { afterEach, describe, expect, it, vi } from 'vitest';
import { requestJson } from '@/lib/api/request';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('requestJson', () => {
  it('returns JSON for a successful response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 })));

    await expect(requestJson<{ ok: boolean }>('/api/test')).resolves.toEqual({ ok: true });
  });

  it('can use an MSW handler for an unmocked network request', async () => {
    await expect(requestJson<{ ok: boolean }>('https://example.com/api/msw-test')).resolves.toEqual({ ok: true });
  });

  it('throws an error with status and response data for failed responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'Unauthorized', reason: 'expired' }), { status: 401 }))
    );

    let error: Error & { status?: number; data?: unknown };
    try {
      await requestJson('/api/test');
      throw new Error('Expected requestJson to throw');
    } catch (value) {
      error = value as Error & { status?: number; data?: unknown };
    }

    expect(error.message).toBe('Unauthorized');
    expect(error.status).toBe(401);
    expect(error.data).toEqual({ error: 'Unauthorized', reason: 'expired' });
  });

  it('uses a fallback message when the API does not provide one', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 500 })));

    await expect(requestJson('/api/test')).rejects.toThrow('Unknown error');
  });
});
