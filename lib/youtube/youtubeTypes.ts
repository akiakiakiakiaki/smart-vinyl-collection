export type YouTubeReleaseQuery = {
  releaseId: number;
  title: string;
  artists: string;
  trackTitles: string[];
  formats: string[];
};

export type YouTubeMatchStatus = 'matched' | 'not-found' | 'unavailable';

export type YouTubeEmbedMatch = {
  kind: 'playlist' | 'videos';
  title: string;
  url: string;
  playlistId?: string;
  videoIds?: string[];
  confidence: number;
};

export type YouTubeMatchResponse = {
  status: YouTubeMatchStatus;
  match?: YouTubeEmbedMatch;
  reason?: 'not-configured' | 'api-error' | 'no-match';
};

export type YouTubeSearchItem = {
  id: {
    kind: string;
    videoId?: string;
    playlistId?: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
  };
};

export type YouTubeSearchResponse = {
  items?: YouTubeSearchItem[];
};

export type YouTubePlaylistItemsResponse = {
  items?: Array<{
    snippet?: {
      title?: string;
    };
  }>;
};
