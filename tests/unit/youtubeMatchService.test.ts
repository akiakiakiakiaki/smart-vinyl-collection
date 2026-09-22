import { beforeEach, describe, expect, it, vi } from 'vitest';
import { matchYouTubeRelease } from '@/lib/youtube/youtubeMatchService';
import { getPlaylistTitles, getVideoId, searchYouTube } from '@/lib/youtube/youtubeClient';
import { readYouTubeMatchCache, writeYouTubeMatchCache } from '@/lib/cache/youtubeMatchesCache';

vi.mock('@/lib/youtube/youtubeClient', () => ({
  getPlaylistTitles: vi.fn(),
  getVideoId: vi.fn(),
  searchYouTube: vi.fn(),
}));

vi.mock('@/lib/cache/youtubeMatchesCache', () => ({
  readYouTubeMatchCache: vi.fn(),
  writeYouTubeMatchCache: vi.fn(),
}));

const searchYouTubeMock = vi.mocked(searchYouTube);
const getPlaylistTitlesMock = vi.mocked(getPlaylistTitles);
const getVideoIdMock = vi.mocked(getVideoId);
const readCacheMock = vi.mocked(readYouTubeMatchCache);
const writeCacheMock = vi.mocked(writeYouTubeMatchCache);

const album = {
  releaseId: 100,
  title: 'Test Album',
  artists: 'Test Artist',
  trackTitles: ['Track One', 'Track Two', 'Track Three'],
  formats: ['1 / Vinyl / LP'],
};

beforeEach(() => {
  vi.clearAllMocks();
  readCacheMock.mockResolvedValue(null);
  writeCacheMock.mockResolvedValue(undefined);
});

describe('matchYouTubeRelease', () => {
  it('matches an album playlist after checking its track titles', async () => {
    searchYouTubeMock.mockResolvedValue({
      items: [{ id: { kind: 'youtube#playlist', playlistId: 'PL123' }, snippet: { title: 'Test Artist - Test Album' , channelTitle: 'Test Artist' } }],
    });
    getPlaylistTitlesMock.mockResolvedValue(['Track One', 'Track Two', 'Track Three']);

    const result = await matchYouTubeRelease(album);

    expect(result).toMatchObject({ status: 'matched', match: { kind: 'playlist', playlistId: 'PL123' } });
    expect(result.match?.url).toContain('list=PL123');
    expect(writeCacheMock).toHaveBeenCalledWith(100, result);
  });

  it('matches up to two tracks for a single', async () => {
    const single = { ...album, releaseId: 101, title: 'Test Single', trackTitles: ['A Side', 'B Side'], formats: ['1 / Vinyl / 7 inch / Single'] };
    searchYouTubeMock
      .mockResolvedValueOnce({ items: [{ id: { kind: 'youtube#video', videoId: 'video-a' }, snippet: { title: 'Test Artist - A Side (Official Audio)', channelTitle: 'Test Artist' } }] })
      .mockResolvedValueOnce({ items: [{ id: { kind: 'youtube#video', videoId: 'video-b' }, snippet: { title: 'Test Artist - B Side (Official Audio)', channelTitle: 'Test Artist' } }] });
    getVideoIdMock.mockImplementation((item) => item.id.videoId ?? null);

    const result = await matchYouTubeRelease(single);

    expect(result).toMatchObject({ status: 'matched', match: { kind: 'videos', videoIds: ['video-a', 'video-b'] } });
    expect(result.match?.url).toContain('playlist=video-b');
  });

  it('reuses a cached result without querying YouTube', async () => {
    readCacheMock.mockResolvedValue({ status: 'not-found', reason: 'no-match' });

    await expect(matchYouTubeRelease(album)).resolves.toEqual({ status: 'not-found', reason: 'no-match' });
    expect(searchYouTubeMock).not.toHaveBeenCalled();
  });
});
