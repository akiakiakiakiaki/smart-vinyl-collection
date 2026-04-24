'use client';

import { Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import SyncIcon from '@mui/icons-material/Sync';
import { formatEta } from '@/lib/formatUtils';

type Props = {
  isRefreshing: boolean;
  isLoading: boolean;
  selectedFolder: string | null;
  onStart: () => void;
  onCancel: () => void;
  fetched: number;
  total: number;
  etaSeconds: number;
};

export function RatingSyncButton({
  isRefreshing,
  isLoading,
  selectedFolder,
  onStart,
  onCancel,
  fetched,
  total,
  etaSeconds,
}: Props) {
  const etaText = formatEta(etaSeconds);
  const progressText = total > 0 ? ` (${fetched}/${total}, ${etaText})` : '';

  return (
    <Button
      variant={isRefreshing ? 'outlined' : 'contained'}
      color={isRefreshing ? 'warning' : 'secondary'}
      startIcon={isRefreshing ? <CloseIcon /> : <RefreshIcon />}
      endIcon={
        isRefreshing ? (
          <SyncIcon
            sx={{
              transformOrigin: 'center',
              animation: 'sync-spin 1s linear infinite',
            }}
          />
        ) : undefined
      }
      onClick={isRefreshing ? onCancel : onStart}
      disabled={!selectedFolder || isLoading}
      sx={{
        ...(isRefreshing && {
          '@keyframes sync-spin': {
            from: { transform: 'rotate(0deg)' },
            to: { transform: 'rotate(-360deg)' },
          },
        }),
      }}
    >
      {isRefreshing ? `Cancel Refresh Ratings${progressText}` : 'Refresh Ratings'}
    </Button>
  );
}
