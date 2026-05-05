'use client';

import Box from '@mui/material/Box';
import { useParams } from 'next/navigation';
import { ReleaseDetail } from '@/components/releases/ReleaseDetail';
import { useReleaseDetail } from '@/hooks/releases/useReleaseDetail';

export default function CollectionReleaseDetailPage() {
  const params = useParams<{ releaseId: string }>();
  const releaseId = typeof params.releaseId === 'string' ? params.releaseId : null;
  const { release, loading, error } = useReleaseDetail(releaseId);

  return (
    <Box sx={{ height: '100%', overflow: 'auto', px: { xs: 2, md: 4 }, py: 3 }}>
      <ReleaseDetail release={release} loading={loading} error={error} />
    </Box>
  );
}
