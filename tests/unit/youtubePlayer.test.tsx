import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { YouTubePlayer } from '@/components/releases/YouTubePlayer';
import { fetchYouTubeMatch } from '@/lib/api/youtubeApi';
import { ReleaseDetailView } from '@/types/release';

vi.mock('@/lib/api/youtubeApi', () => ({ fetchYouTubeMatch: vi.fn() }));

const fetchMatchMock = vi.mocked(fetchYouTubeMatch);
const release = {
  id: 100,
  title: 'Test Album',
  artists: 'Test Artist',
  formats: ['Vinyl'],
  tracklist: [{ position: 'A1', title: 'Track One', duration: '', artists: '', extraArtists: '', type: 'track' }],
} as ReleaseDetailView;

beforeEach(() => vi.clearAllMocks());

describe('YouTubePlayer', () => {
  it('renders a matched embed', async () => {
    fetchMatchMock.mockResolvedValue({
      status: 'matched',
      match: { kind: 'playlist', title: 'Test Album', url: 'https://www.youtube.com/embed?listType=playlist&list=PL123', confidence: 0.9 },
    });

    render(<YouTubePlayer release={release} />);

    await waitFor(() => expect(screen.getByTitle('YouTube player for Test Album')).toHaveAttribute('src', expect.stringContaining('PL123')));
  });

  it('renders a fallback search link when no match is available', async () => {
    fetchMatchMock.mockResolvedValue({ status: 'not-found', reason: 'no-match' });

    render(<YouTubePlayer release={release} />);

    await waitFor(() => expect(screen.getByRole('link', { name: 'Search YouTube manually' })).toBeInTheDocument());
  });
});
