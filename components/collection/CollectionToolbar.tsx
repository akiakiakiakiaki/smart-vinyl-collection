'use client';

import { Box, Button, Chip, Stack, Tooltip } from '@mui/material';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import RefreshIcon from '@mui/icons-material/Refresh';

import { COLLECTION_COLUMN_OPTIONS, DEFAULT_COLUMN_VISIBILITY } from '@/lib/collectionColumns';

import { useCollectionToolbarStore } from '@/store/selectors/useCollectionToolbarStore';
import { RatingSyncButton } from '@/components/collection/RatingSyncButton';
import { FolderSelect } from '@/components/collection/FolderSelect';
import { useState } from 'react';
import { ColumnPopover } from '@/components/collection/ColumnPopover';
import { useTranslations } from 'next-intl';

export function CollectionToolbar() {
  const t = useTranslations('collection');
  const {
    selectedFolder,
    setSelectedFolder,
    isLoading,
    isRefreshing,
    cachedFolders,
    triggerReleasesRefresh,
    triggerRatingsRefresh,
    cancelRefresh,
    ratingSyncFetched,
    ratingSyncTotal,
    ratingSyncEtaSeconds,
    columnVisibilityModel,
    setColumnVisibility,
    resetColumnVisibility,
  } = useCollectionToolbarStore();

  const canRefresh = Boolean(selectedFolder) && Boolean(cachedFolders[selectedFolder]) && !isLoading && !isRefreshing;

  const canRefreshRatings =
    Boolean(selectedFolder) && Boolean(cachedFolders[selectedFolder]) && !isLoading && !isRefreshing;

  const effectiveColumnVisibilityModel = { ...DEFAULT_COLUMN_VISIBILITY, ...columnVisibilityModel };

  const visibleColumnCount = COLLECTION_COLUMN_OPTIONS.filter(
    (column) => effectiveColumnVisibilityModel[column.field]
  ).length;

  const isDefaultColumnLayout = COLLECTION_COLUMN_OPTIONS.every(
    (column) => effectiveColumnVisibilityModel[column.field] === DEFAULT_COLUMN_VISIBILITY[column.field]
  );

  const [columnAnchorEl, setColumnAnchorEl] = useState<HTMLButtonElement | null>(null);

  const columnsOpen = Boolean(columnAnchorEl);

  const handleRefresh = () => {
    if (!canRefresh) return;
    triggerReleasesRefresh();
  };

  const handleRefreshRatings = () => {
    if (!canRefreshRatings) return;
    triggerRatingsRefresh();
  };

  const handleToggleColumn = (field: (typeof COLLECTION_COLUMN_OPTIONS)[number]['field']) => {
    setColumnVisibility(field, !effectiveColumnVisibilityModel[field]);
  };

  const mobileButtonSx = {
    flex: 1,
    minWidth: 0,
    fontSize: { xs: '0.75rem', sm: '0.875rem' },
    px: { xs: 1, sm: 2 },
    whiteSpace: 'nowrap',
  };

  return (
    <Stack
      component="header"
      direction={{ xs: 'column', md: 'row' }}
      spacing={{ xs: 1, md: 2 }}
      sx={{ mb: 2, alignItems: { xs: 'stretch', md: 'center' } }}
    >
      <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
        <FolderSelect
          selectedFolder={selectedFolder}
          onChange={setSelectedFolder}
          sx={{ width: '100%', minWidth: { md: 180 } }}
        />
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ width: { xs: '100%', md: 'auto' }, alignItems: { xs: 'stretch', sm: 'center' } }}
      >
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={!canRefresh}
          sx={mobileButtonSx}
        >
          {t('refreshReleases')}
        </Button>

        <RatingSyncButton
          isRefreshing={isRefreshing}
          isLoading={isLoading}
          selectedFolder={selectedFolder}
          onStart={handleRefreshRatings}
          onCancel={cancelRefresh}
          fetched={ratingSyncFetched}
          total={ratingSyncTotal}
          etaSeconds={ratingSyncEtaSeconds}
          sx={mobileButtonSx}
        />
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        sx={{ ml: { xs: 0, md: 'auto' }, width: { xs: '100%', md: 'auto' }, alignItems: 'center' }}
      >
        <Tooltip title={t('showOrHideColumns')}>
          <Button
            variant={isDefaultColumnLayout ? 'outlined' : 'contained'}
            color={isDefaultColumnLayout ? 'secondary' : 'info'}
            startIcon={<ViewColumnIcon />}
            onClick={(event) => setColumnAnchorEl(event.currentTarget)}
            sx={{ minWidth: { xs: 0, sm: 150 }, flex: { xs: 1, md: 'initial' } }}
          >
            Columns
          </Button>
        </Tooltip>

        <Chip
          size="small"
          label={`${visibleColumnCount}/${COLLECTION_COLUMN_OPTIONS.length}`}
          color={isDefaultColumnLayout ? 'default' : 'info'}
        />
      </Stack>

      <ColumnPopover
        open={columnsOpen}
        anchorEl={columnAnchorEl}
        onClose={() => setColumnAnchorEl(null)}
        columnVisibilityModel={effectiveColumnVisibilityModel}
        onToggle={handleToggleColumn}
        onReset={resetColumnVisibility}
      />
    </Stack>
  );
}
