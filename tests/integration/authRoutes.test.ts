import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as startOAuth } from '@/app/api/discogs/auth/start/route';
import { GET as callbackOAuth } from '@/app/api/discogs/auth/callback/route';
import { GET as logout } from '@/app/api/discogs/auth/logout/route';
import { buildOAuthHeader } from '@/lib/discogs/oAuth';

vi.mock('@/lib/discogs/oAuth', () => ({
  buildOAuthHeader: vi.fn(() => 'OAuth test-header'),
}));

const buildOAuthHeaderMock = vi.mocked(buildOAuthHeader);

beforeEach(() => {
  vi.stubEnv('DISCOGS_CONSUMER_KEY', 'consumer-key');
  vi.stubEnv('DISCOGS_CONSUMER_SECRET', 'consumer-secret');
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('Discogs OAuth routes', () => {
  it('returns a configuration error when OAuth credentials are missing', async () => {
    vi.stubEnv('DISCOGS_CONSUMER_KEY', '');

    const response = await startOAuth();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: 'Missing DISCOGS_CONSUMER_KEY or DISCOGS_CONSUMER_SECRET in .env.local',
    });
  });

  it('redirects to Discogs authorization and stores the request secret', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response('oauth_token=request-token&oauth_token_secret=request-secret', { status: 200 })
    );

    const response = await startOAuth();

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'https://www.discogs.com/oauth/authorize?oauth_token=request-token'
    );
    expect(response.headers.get('set-cookie')).toContain('discogs_request_secret=request-secret');
    expect(buildOAuthHeaderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'https://api.discogs.com/oauth/request_token',
        extraParams: { oauth_callback: 'http://localhost:3000/api/discogs/auth/callback' },
      })
    );
  });

  it('returns an error when Discogs does not provide a request token', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('error=denied', { status: 200 }));

    const response = await startOAuth();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Failed to get request token' });
  });

  it('exchanges the callback token, resolves identity and sets access cookies', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response('oauth_token=access-token&oauth_token_secret=access-secret'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ username: 'tester' }), { status: 200 }));

    const response = await callbackOAuth(
      new Request('http://localhost:3000/api/discogs/auth/callback?oauth_token=request-token&oauth_verifier=verifier', {
        headers: { cookie: 'discogs_request_secret=request-secret' },
      })
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/');
    const cookies = response.headers.get('set-cookie') ?? '';
    expect(cookies).toContain('discogs_access_token=access-token');
    expect(cookies).toContain('discogs_access_secret=access-secret');
    expect(cookies).toContain('discogs_username=tester');
    expect(buildOAuthHeaderMock).toHaveBeenCalledTimes(2);
  });

  it('returns an error when the callback exchange has no access token', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('oauth_token=access-token', { status: 200 }));

    const response = await callbackOAuth(
      new Request('http://localhost:3000/api/discogs/auth/callback?oauth_token=request-token&oauth_verifier=verifier')
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Failed to get access token' });
  });

  it('expires all authentication cookies on logout', async () => {
    const response = await logout(new Request('http://localhost:3000/api/discogs/auth/logout'));
    const cookies = response.headers.get('set-cookie') ?? '';

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/logout');
    expect(cookies.match(/discogs_(access_token|access_secret|username|request_secret)=/g)).toHaveLength(4);
    expect(cookies).toContain('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  });
});
