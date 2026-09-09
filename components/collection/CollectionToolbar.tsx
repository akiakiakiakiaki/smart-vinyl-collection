'use client';

import { Button, Tooltip, Chip } from '@mui/material';
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

  return (
    <header className="mb-4 flex items-center gap-2">
      <FolderSelect
        selectedFolder={selectedFolder}
        onChange={setSelectedFolder}
      />

      <Button
        variant="contained"
        startIcon={<RefreshIcon />}
        onClick={handleRefresh}
        disabled={!canRefresh}
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
      />

      <div className="ml-auto flex items-center gap-2">
          <Tooltip title={t('showOrHideColumns')}>
          <Button
            variant={isDefaultColumnLayout ? 'outlined' : 'contained'}
            color={isDefaultColumnLayout ? 'secondary' : 'info'}
            startIcon={<ViewColumnIcon />}
            onClick={(event) => setColumnAnchorEl(event.currentTarget)}
            sx={{ minWidth: 150 }}
          >
            Columns
          </Button>
        </Tooltip>

        <Chip
          size="small"
          label={`${visibleColumnCount}/${COLLECTION_COLUMN_OPTIONS.length}`}
          color={isDefaultColumnLayout ? 'default' : 'info'}
        />
      </div>

      <ColumnPopover
        open={columnsOpen}
        anchorEl={columnAnchorEl}
        onClose={() => setColumnAnchorEl(null)}
        columnVisibilityModel={effectiveColumnVisibilityModel}
        onToggle={handleToggleColumn}
        onReset={resetColumnVisibility}
      />
    </header>
  );
}
