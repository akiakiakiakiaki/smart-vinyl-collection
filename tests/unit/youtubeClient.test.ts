import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getPlaylistTitles, searchYouTube } from '@/lib/youtube/youtubeClient';

beforeEach(() => {
  vi.stubEnv('YOUTUBE_API_KEY', 'test-key');
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('YouTube client', () => {
  it('searches embeddable videos with the server-side API key header', async () => {
    vi.mocked(fetch).mockResolvedValue(Response.json({ items: [] }));

    await searchYouTube('Artist Track official audio', 'video');

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      expect.stringContaining('https://www.googleapis.com/youtube/v3/search?'),
      expect.objectContaining({ headers: { 'x-goog-api-key': 'test-key' } })
    );
    const url = new URL(String(vi.mocked(fetch).mock.calls[0][0]));
    expect(url.searchParams.get('type')).toBe('video');
    expect(url.searchParams.get('videoEmbeddable')).toBe('true');
  });

  it('maps playlist item titles', async () => {
    vi.mocked(fetch).mockResolvedValue(
      Response.json({ items: [{ snippet: { title: 'Track One' } }, { snippet: { title: 'Track Two' } }] })
    );

    await expect(getPlaylistTitles('PL123')).resolves.toEqual(['Track One', 'Track Two']);
  });

  it('throws a useful error when the API key is missing', async () => {
    vi.unstubAllEnvs();

    await expect(searchYouTube('Artist', 'playlist')).rejects.toMatchObject({
      status: 503,
      message: 'Missing YOUTUBE_API_KEY',
    });
  });
});
