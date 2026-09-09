import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getFolderReleasesPage,
  getFolders,
  getIdentity,
  getReleaseDetails,
  getUserProfile,
} from '@/lib/discogs/client';
import { buildOAuthHeader } from '@/lib/discogs/oAuth';

vi.mock('@/lib/discogs/oAuth', () => ({
  buildOAuthHeader: vi.fn(() => 'OAuth test-header'),
}));

const ctx = {
  consumerKey: 'consumer-key',
  consumerSecret: 'consumer-secret',
  token: 'access-token',
  tokenSecret: 'access-secret',
};

const buildOAuthHeaderMock = vi.mocked(buildOAuthHeader);

beforeEach(() => {
  vi.stubEnv('DISCOGS_API_URL', 'https://api.discogs.com/');
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('Discogs client', () => {
  it('builds authenticated URLs for all supported endpoints', async () => {
    vi.mocked(fetch).mockImplementation(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await getIdentity(ctx);
    await getUserProfile('tester', ctx);
    await getFolders('tester', ctx);
    await getFolderReleasesPage('tester', 123, 2, ctx, 50);
    await getReleaseDetails(100, ctx);

    expect(vi.mocked(fetch).mock.calls.map(([url]) => url)).toEqual([
      'https://api.discogs.com/oauth/identity',
      'https://api.discogs.com/users/tester',
      'https://api.discogs.com/users/tester/collection/folders',
      'https://api.discogs.com/users/tester/collection/folders/123/releases?per_page=50&page=2',
      'https://api.discogs.com/releases/100',
    ]);
    expect(buildOAuthHeaderMock).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', consumerKey: ctx.consumerKey, token: ctx.token })
    );
  });

  it('passes an abort signal to release-page requests', async () => {
    const signal = new AbortController().signal;
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 200 }));

    await getFolderReleasesPage('tester', 123, 1, ctx, 100, signal);

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal, headers: { Authorization: 'OAuth test-header' } })
    );
  });

  it('throws DiscogsUpstreamError with JSON error data', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: 'Folder not found' }), { status: 404 })
    );

    await expect(getFolders('tester', ctx)).rejects.toMatchObject({
      name: 'DiscogsUpstreamError',
      status: 404,
      upstream: { message: 'Folder not found' },
    });
  });

  it('preserves text upstream errors when the response is not JSON', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('rate limited', { status: 429 }));

    await expect(getIdentity(ctx)).rejects.toMatchObject({ status: 429, upstream: 'rate limited' });
  });

  it('returns null upstream data for an empty error response', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('', { status: 500 }));

    await expect(getReleaseDetails(100, ctx)).rejects.toMatchObject({ status: 500, upstream: null });
  });

  it('rejects when the Discogs API URL is not configured', async () => {
    vi.stubEnv('DISCOGS_API_URL', '');

    await expect(getIdentity(ctx)).rejects.toThrow('Missing DISCOGS_API_URL in .env.local');
  });
});
