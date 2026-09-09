import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';
import { GET } from '@/app/api/discogs/route';
import { getAuth } from '@/lib/auth';
import { getCollection, getFolders } from '@/lib/services/collectionService';
import { handleIdentityRequest } from '@/lib/services/identityService';

vi.mock('@/lib/auth', () => ({
  getAuth: vi.fn(),
}));

vi.mock('@/lib/services/collectionService', () => ({
  getCollection: vi.fn(),
  getFolders: vi.fn(),
}));

vi.mock('@/lib/services/identityService', () => ({
  handleIdentityRequest: vi.fn(),
}));

const getAuthMock = vi.mocked(getAuth);
const getCollectionMock = vi.mocked(getCollection);
const getFoldersMock = vi.mocked(getFolders);
const handleIdentityRequestMock = vi.mocked(handleIdentityRequest);

beforeEach(() => vi.clearAllMocks());

describe('GET /api/discogs', () => {
  it('returns 401 when there is no authenticated session', async () => {
    getAuthMock.mockResolvedValue(null);

    const response = await GET(new Request('http://localhost:3000/api/discogs?folder=CR'));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
  });

  it('passes folder refresh requests to the collection service', async () => {
    getAuthMock.mockResolvedValue({ token: 'token', secret: 'secret', username: 'tester' });
    getCollectionMock.mockResolvedValue(NextResponse.json({ releases: [], releaseDetailsByReleaseId: {} }));

    await GET(new Request('http://localhost:3000/api/discogs?folder=CR&refresh=true'));

    expect(getCollectionMock).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'tester', folderName: 'CR', refresh: true })
    );
  });

  it('force-refreshes folders for folders-only requests', async () => {
    getAuthMock.mockResolvedValue({ token: 'token', secret: 'secret', username: 'tester' });
    getFoldersMock.mockResolvedValue({ folders: [{ id: 1, name: 'CR' }] });

    const response = await GET(new Request('http://localhost:3000/api/discogs?folders=true&refresh=true'));

    expect(response.status).toBe(200);
    expect(getFoldersMock).toHaveBeenCalledWith('tester', expect.any(Object), { forceRefresh: true });
    expect(await response.json()).toEqual({ folders: [{ id: 1, name: 'CR' }] });
  });

  it('returns an anonymous identity without requiring authentication', async () => {
    getAuthMock.mockResolvedValue(null);

    const response = await GET(new Request('http://localhost:3000/api/discogs?identity=true'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ username: null, name: null, avatar_url: null });
  });

  it('delegates authenticated identity requests with the session context', async () => {
    getAuthMock.mockResolvedValue({ token: 'token', secret: 'secret', username: 'tester' });
    handleIdentityRequestMock.mockResolvedValue(
      NextResponse.json({ username: 'tester', name: null, avatar_url: null })
    );

    const response = await GET(new Request('http://localhost:3000/api/discogs?identity=true'));

    expect(response.status).toBe(200);
    expect(handleIdentityRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({ token: 'token', tokenSecret: 'secret' }),
      'tester'
    );
  });

  it('returns a session error when folders are requested without a username', async () => {
    getAuthMock.mockResolvedValue({ token: 'token', secret: 'secret', username: null });

    const response = await GET(new Request('http://localhost:3000/api/discogs?folders=true'));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: 'Missing Discogs username in session. Please sign out and sign in again.',
    });
  });

  it('returns a session error for collection requests without a username', async () => {
    getAuthMock.mockResolvedValue({ token: 'token', secret: 'secret', username: null });

    const response = await GET(new Request('http://localhost:3000/api/discogs?folder=CR'));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: 'Missing Discogs username in session. Please sign out and sign in again.',
    });
    expect(getCollectionMock).not.toHaveBeenCalled();
  });
});
