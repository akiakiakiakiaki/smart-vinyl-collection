'use client';

import { useCallback, useMemo, useState } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import IconButton from '@mui/material/IconButton';
import Rating from '@mui/material/Rating';
import Tooltip from '@mui/material/Tooltip';

import { useCollectionStore } from '@/store/useCollectionStore';

import { formatDiscogsDate, formatPrice } from '@/lib/formatUtils';
import { DEFAULT_COLUMN_VISIBILITY } from '@/lib/collectionColumns';
import { CollectionOverviewRow } from '@/types/collection';
import { useLocale, useTranslations } from 'next-intl';

type Props = {
  rows: CollectionOverviewRow[];
  loading: boolean;
  selectedFolder: string | null;
  columnVisibilityModel: Record<string, boolean>;
  onFetchReleaseDetails: (releaseId: number) => Promise<void>;
};

export function CollectionDataGrid({
  rows,
  loading,
  selectedFolder,
  columnVisibilityModel,
  onFetchReleaseDetails,
}: Props) {
  const t = useTranslations('collection');
  const locale = useLocale();
  const router = useRouter();
  const [fetchingReleaseIds, setFetchingReleaseIds] = useState<Set<number>>(new Set());

  const paginationModel = useCollectionStore((s) => s.paginationModel);
  const sortModel = useCollectionStore((s) => s.sortModel);
  const setPaginationModel = useCollectionStore((s) => s.setPaginationModel);
  const setSortModel = useCollectionStore((s) => s.setSortModel);
  const hasHydrated = useCollectionStore((s) => s.hasHydrated);

  const handleFetchReleaseDetails = useCallback(async (releaseId: number) => {
    setFetchingReleaseIds((prev) => new Set(prev).add(releaseId));

    try {
      await onFetchReleaseDetails(releaseId);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingReleaseIds((prev) => {
        const next = new Set(prev);
        next.delete(releaseId);
        return next;
      });
    }
  }, [onFetchReleaseDetails]);

  const renderRatingCell = useCallback(
    (params: GridRenderCellParams<CollectionOverviewRow, string | null>) =>
      params.value ? (
        <div style={{ position: 'relative', width: 50, height: 50 }}>
          <Image
            src={params.value as string}
            alt={t('cover')}
            fill
            sizes="50px"
            style={{ objectFit: 'contain' }}
            loading="eager"
          />
        </div>
      ) : null,
    [t]
  );

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'cover',
        headerName: t('columnLabels.cover'),
        width: 100,
        sortable: false,
        renderCell: renderRatingCell,
      },
      { field: 'artist', headerName: t('columnLabels.artist'), flex: 1 },
      { field: 'displayTitle', headerName: t('columnLabels.displayTitle'), flex: 1 },
      { field: 'year', headerName: t('columnLabels.year'), width: 120 },
      { field: 'formats', headerName: t('columnLabels.formats'), flex: 1.2 },
      { field: 'labels', headerName: t('columnLabels.labels'), flex: 1.2 },
      { field: 'genres', headerName: t('columnLabels.genres'), flex: 1 },
      { field: 'styles', headerName: t('columnLabels.styles'), flex: 1.2 },
      {
        field: 'lowestPrice',
        headerName: t('lowestPrice'),
        width: 140,
        sortComparator: (v1, v2) => (v1 ?? Number.POSITIVE_INFINITY) - (v2 ?? Number.POSITIVE_INFINITY),
        renderCell: (params) => {
          const value = params.value as number | null | undefined;
          const row = params.row as CollectionOverviewRow;
          const isFetching = fetchingReleaseIds.has(row.id);

          if (value != null) {
            return formatPrice(value, locale);
          }

          if (row.releaseDetailsLoaded) {
            return '-';
          }

          return (
            <Tooltip title={t('fetchReleaseDetails')}>
              <span>
                <IconButton
                  size="small"
                  aria-label={t('fetchReleaseDetails')}
                  disabled={isFetching}
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleFetchReleaseDetails(row.id);
                  }}
                >
                  <CloudDownloadIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          );
        },
      },
      {
        field: 'dateAdded',
        headerName: t('added'),
        width: 180,
        valueFormatter: (value) => formatDiscogsDate((value as string) ?? '', locale),
      },
      {
        field: 'rating',
        headerName: t('rating'),
        width: 150,
        sortComparator: (v1, v2) => (v1 ?? -1) - (v2 ?? -1),
        renderCell: (params) => {
          const value = params.value as number | null | undefined;

          if (value == null) {
            return <span>-</span>;
          }

          return (
            <Rating
              value={value}
              max={5}
              readOnly
              size="small"
            />
          );
        },
      },
    ],
    [fetchingReleaseIds, handleFetchReleaseDetails, locale, renderRatingCell, t]
  );

  const mergedColumnVisibility = useMemo(
    () => ({ ...DEFAULT_COLUMN_VISIBILITY, ...columnVisibilityModel }),

    [columnVisibilityModel]
  );

  const getRowId = useCallback((row: CollectionOverviewRow) => `${selectedFolder}-${row.instanceId ?? row.id}`, [selectedFolder]);

  if (!hasHydrated) {
    return null;
  }

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        columnVisibilityModel={mergedColumnVisibility}
        getRowId={getRowId}
        pageSizeOptions={[10, 25, 50, 100]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        loading={loading}
        onRowClick={(params) => {
          router.push(`/collection/releases/${params.row.id}`);
        }}
        sx={{
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
          },
        }}
      />
    </div>
  );
}
