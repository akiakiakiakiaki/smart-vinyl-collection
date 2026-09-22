import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/youtube/release/route';
import { getAuth } from '@/lib/auth';
import { matchYouTubeRelease } from '@/lib/youtube/youtubeMatchService';

vi.mock('@/lib/auth', () => ({ getAuth: vi.fn() }));
vi.mock('@/lib/youtube/youtubeMatchService', () => ({ matchYouTubeRelease: vi.fn() }));

const getAuthMock = vi.mocked(getAuth);
const matchMock = vi.mocked(matchYouTubeRelease);

const body = {
  releaseId: 100,
  title: 'Test Album',
  artists: 'Test Artist',
  trackTitles: ['Track One'],
  formats: ['Vinyl'],
};

beforeEach(() => vi.clearAllMocks());

describe('POST /api/youtube/release', () => {
  it('requires an authenticated session', async () => {
    getAuthMock.mockResolvedValue(null);

    const response = await POST(new Request('http://localhost/api/youtube/release', { method: 'POST', body: JSON.stringify(body) }));

    expect(response.status).toBe(401);
    expect(matchMock).not.toHaveBeenCalled();
  });

  it('validates input and returns the match result', async () => {
    getAuthMock.mockResolvedValue({ token: 'token', secret: 'secret', username: 'tester' });
    matchMock.mockResolvedValue({ status: 'not-found', reason: 'no-match' });

    const response = await POST(new Request('http://localhost/api/youtube/release', { method: 'POST', body: JSON.stringify(body) }));

    expect(response.status).toBe(200);
    expect(matchMock).toHaveBeenCalledWith(body);
    await expect(response.json()).resolves.toEqual({ status: 'not-found', reason: 'no-match' });
  });

  it('rejects malformed release data', async () => {
    getAuthMock.mockResolvedValue({ token: 'token', secret: 'secret', username: 'tester' });

    const response = await POST(new Request('http://localhost/api/youtube/release', { method: 'POST', body: JSON.stringify({ releaseId: '100' }) }));

    expect(response.status).toBe(400);
  });
});
