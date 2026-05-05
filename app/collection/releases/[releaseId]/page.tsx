'use client';

import { useParams } from 'next/navigation';
import { ReleaseDetail } from '@/components/releases/ReleaseDetail';
import { useReleaseDetail } from '@/hooks/releases/useReleaseDetail';

export default function CollectionReleaseDetailPage() {
  const params = useParams<{ releaseId: string }>();
  const releaseId = typeof params.releaseId === 'string' ? params.releaseId : null;
  const { release, loading, error } = useReleaseDetail(releaseId);

  return (
    <ReleaseDetail
      release={release}
      loading={loading}
      error={error}
    />
  );
}
