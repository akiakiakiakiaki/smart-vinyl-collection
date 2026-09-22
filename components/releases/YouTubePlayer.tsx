'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { fetchYouTubeMatch } from '@/lib/api/youtubeApi';
import { YouTubeMatchResponse } from '@/lib/youtube/youtubeTypes';
import { ReleaseDetailView } from '@/types/release';

export function YouTubePlayer({ release }: { release: ReleaseDetailView }) {
  const t = useTranslations('release');
  const [result, setResult] = useState<{ releaseId: number; response: YouTubeMatchResponse } | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetchYouTubeMatch(
      {
        releaseId: release.id,
        title: release.title,
        artists: release.artists,
        trackTitles: release.tracklist.filter((track) => track.type !== 'heading').map((track) => track.title),
        formats: release.formats,
      },
      controller.signal
    )
      .then((response) => setResult({ releaseId: release.id, response }))
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        setResult({ releaseId: release.id, response: { status: 'unavailable', reason: 'api-error' } });
      });

    return () => controller.abort();
  }, [release]);

  if (!result || result.releaseId !== release.id) {
    return (
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <CircularProgress size={20} aria-label={t('youtubeLoading')} />
        <Typography color="text.secondary">{t('youtubeLoading')}</Typography>
      </Stack>
    );
  }

  const response = result.response;

  if (response.status !== 'matched' || !response.match) {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${release.artists} ${release.title}`)}`;
    return (
      <Alert severity="info">
        <Stack spacing={1}>
          <Typography>{response.reason === 'not-configured' ? t('youtubeUnavailable') : t('youtubeNotFound')}</Typography>
          <Link href={searchUrl} target="_blank" rel="noreferrer">
            {t('youtubeSearch')}
          </Link>
        </Stack>
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%', aspectRatio: '16 / 9', maxWidth: 900, bgcolor: 'common.black' }}>
      <Box
        component="iframe"
        title={t('youtubePlayerTitle', { title: release.title })}
        src={response.match.url}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        sx={{ display: 'block', width: '100%', height: '100%', border: 0 }}
      />
    </Box>
  );
}
