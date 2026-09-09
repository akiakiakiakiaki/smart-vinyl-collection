'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import SyncIcon from '@mui/icons-material/Sync';
import { useReleaseStore } from '@/store/useReleaseStore';
import { useTranslations } from 'next-intl';

export function ReleaseToolbar() {
  const t = useTranslations('release');
  const params = useParams<{ releaseId: string }>();
  const releaseId = typeof params.releaseId === 'string' ? params.releaseId : null;
  const isRefreshing = useReleaseStore((s) => (releaseId ? Boolean(s.refreshingReleaseIds[releaseId]) : false));
  const triggerReleaseRefresh = useReleaseStore((s) => s.triggerReleaseRefresh);

  const handleRefresh = () => {
    if (!releaseId || isRefreshing) return;
    triggerReleaseRefresh(releaseId);
  };

  return (
    <Stack
      component="header"
      direction="row"
      spacing={2}
      sx={{ mb: 3, alignItems: 'center' }}
    >
      <Button
        startIcon={<ArrowBackIcon />}
        component={Link}
        href="/collection/overview"
        variant="outlined"
      >
        {t('backToCollection')}
      </Button>

      <Button
        variant="contained"
        startIcon={isRefreshing ? <SyncIcon /> : <RefreshIcon />}
        onClick={handleRefresh}
        disabled={!releaseId || isRefreshing}
        sx={{
          ...(isRefreshing && {
            '& .MuiButton-startIcon': {
              transformOrigin: 'center',
              animation: 'release-refresh-spin 1s linear infinite',
            },
            '@keyframes release-refresh-spin': {
              from: { transform: 'rotate(0deg)' },
              to: { transform: 'rotate(-360deg)' },
            },
          }),
        }}
      >
        {isRefreshing ? t('refreshing') : t('refresh')}
      </Button>
    </Stack>
  );
}
