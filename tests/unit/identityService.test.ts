import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getIdentity, getUserProfile } from '@/lib/discogs/client';
import { DiscogsUpstreamError } from '@/lib/discogs/errors';
import { handleIdentityRequest } from '@/lib/services/identityService';

vi.mock('@/lib/discogs/client', () => ({
  getIdentity: vi.fn(),
  getUserProfile: vi.fn(),
}));

const getIdentityMock = vi.mocked(getIdentity);
const getUserProfileMock = vi.mocked(getUserProfile);
const ctx = { consumerKey: 'key', consumerSecret: 'secret', token: 'token', tokenSecret: 'token-secret' };

beforeEach(() => vi.clearAllMocks());

describe('handleIdentityRequest', () => {
  it('loads identity and profile and stores a missing username in a cookie', async () => {
    getIdentityMock.mockResolvedValue({ username: 'tester' });
    getUserProfileMock.mockResolvedValue({ name: 'Test User', avatar_url: 'avatar.jpg' });

    const response = await handleIdentityRequest(ctx, null);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      username: 'tester',
      name: 'Test User',
      avatar_url: 'avatar.jpg',
    });
    expect(response.headers.get('set-cookie')).toContain('discogs_username=tester');
    expect(getUserProfileMock).toHaveBeenCalledWith('tester', ctx);
  });

  it('prefers the username from the session cookie', async () => {
    getIdentityMock.mockResolvedValue({ username: 'identity-user' });
    getUserProfileMock.mockResolvedValue({ name: 'Cookie User' });

    const response = await handleIdentityRequest(ctx, 'cookie-user');

    expect(response.status).toBe(200);
    expect(getUserProfileMock).toHaveBeenCalledWith('cookie-user', ctx);
    expect(response.headers.get('set-cookie')).toBeNull();
  });

  it('returns 502 when neither identity nor session contains a username', async () => {
    getIdentityMock.mockResolvedValue({});

    const response = await handleIdentityRequest(ctx, null);

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({ error: 'Identity missing username' });
    expect(getUserProfileMock).not.toHaveBeenCalled();
  });

  it('preserves upstream identity errors', async () => {
    getIdentityMock.mockRejectedValue(new DiscogsUpstreamError('Identity unavailable', 503, { reason: 'offline' }));

    const response = await handleIdentityRequest(ctx, null);

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Identity unavailable',
      upstream: { reason: 'offline' },
    });
  });

  it('converts unexpected identity errors to 500', async () => {
    getIdentityMock.mockRejectedValue(new Error('Unexpected failure'));

    const response = await handleIdentityRequest(ctx, null);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Unexpected failure' });
  });
});
