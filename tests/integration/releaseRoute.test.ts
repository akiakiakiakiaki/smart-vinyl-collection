import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';
import { GET } from '@/app/api/discogs/releases/[releaseId]/route';
import { getAuth } from '@/lib/auth';
import { getReleaseDetail } from '@/lib/services/releaseService';

vi.mock('@/lib/auth', () => ({
  getAuth: vi.fn(),
}));

vi.mock('@/lib/services/releaseService', () => ({
  getReleaseDetail: vi.fn(),
}));

const getAuthMock = vi.mocked(getAuth);
const getReleaseDetailMock = vi.mocked(getReleaseDetail);

beforeEach(() => vi.clearAllMocks());

describe('GET /api/discogs/releases/[releaseId]', () => {
  it('returns 401 without an authenticated session', async () => {
    getAuthMock.mockResolvedValue(null);

    const response = await GET(new Request('http://localhost:3000/api/discogs/releases/100'), {
      params: Promise.resolve({ releaseId: '100' }),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
    expect(getReleaseDetailMock).not.toHaveBeenCalled();
  });

  it('passes the authenticated context and refresh flag to the service', async () => {
    getAuthMock.mockResolvedValue({ token: 'token', secret: 'secret', username: 'tester' });
    getReleaseDetailMock.mockResolvedValue(
      NextResponse.json({ release: { id: 100 } as never, userRating: 4 }) as Awaited<ReturnType<typeof getReleaseDetail>>
    );

    const response = await GET(new Request('http://localhost:3000/api/discogs/releases/100?refresh=true'), {
      params: Promise.resolve({ releaseId: '100' }),
    });

    expect(response.status).toBe(200);
    expect(getReleaseDetailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        releaseId: '100',
        username: 'tester',
        refresh: true,
        ctx: expect.objectContaining({ token: 'token', tokenSecret: 'secret' }),
      })
    );
  });
});
