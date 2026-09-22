'use client';

import { useCollectionStore } from '@/store/useCollectionStore';
import { useCollectionData } from '@/hooks/collection/useCollectionData';
import { useRatingSync } from '@/hooks/collection/useRatingSync';
import { CollectionDataGrid } from '@/components/collection/CollectionDataGrid';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import visuallyHidden from '@mui/utils/visuallyHidden';

export default function CollectionOverview() {
  const t = useTranslations('collection');
  const selectedFolder = useCollectionStore((s) => s.selectedFolder);
  const columnVisibilityModel = useCollectionStore((s) => s.columnVisibilityModel);

  const { rows, setRows, loading, error, fetchReleaseDetails } = useCollectionData(selectedFolder);

  useRatingSync(selectedFolder, rows, setRows);

  if (error) {
    return (
      <Box>
        <Typography component="h2" variant="h6">{t('collectionError')}</Typography>
        <Typography component="p">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', minWidth: 0 }}>
      <Typography component="h1" sx={visuallyHidden}>{t('overviewTitle')}</Typography>
      <Box sx={{ height: '100%', minWidth: 0 }}>
        <CollectionDataGrid
          rows={rows}
          loading={loading}
          selectedFolder={selectedFolder}
          columnVisibilityModel={columnVisibilityModel}
          onFetchReleaseDetails={fetchReleaseDetails}
        />
      </Box>
    </Box>
  );
}
