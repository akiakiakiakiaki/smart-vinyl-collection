'use client';

import { useState, useEffect } from 'react';
import { CollectionOverviewRow } from '../types/collection';

import Rating from '@mui/material/Rating';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Image from 'next/image';

import { DEFAULT_COLUMN_VISIBILITY } from '../lib/collectionColumns';
import { formatDiscogsDate } from '../lib/formatUtils';
import { useCollectionStore } from '../store/useCollectionStore';

export default function HomePage() {
  const [rows, setRows] = useState<CollectionOverviewRow[]>([]);

  // resolves hidration problems
  const selectedFolder = useCollectionStore((s) => s.selectedFolder);
  const refreshVersion = useCollectionStore((s) => s.refreshVersion);
  const setIsLoading = useCollectionStore((s) => s.setIsLoading);
  const setIsRefreshing = useCollectionStore((s) => s.setIsRefreshing);
  const markFolderCached = useCollectionStore((s) => s.markFolderCached);
  const columnVisibilityModel = useCollectionStore((s) => s.columnVisibilityModel);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const columns: GridColDef[] = [
    {
      field: 'cover',
      headerName: 'Cover',
      width: 100,
      sortable: false,
      renderCell: (params) =>
        params.value ? (
          <div style={{ position: 'relative', width: 50, height: 50 }}>
            <Image
              src={params.value as string}
              alt="cover"
              fill
              sizes="50px"
              style={{ objectFit: 'contain' }}
            />
          </div>
        ) : null,
    },
    { field: 'artist', headerName: 'Artist', flex: 1 },
    { field: 'displayTitle', headerName: 'Title', flex: 1 },
    { field: 'year', headerName: 'Year', width: 120 },
    { field: 'formats', headerName: 'Formats', flex: 1.2 },
    { field: 'labels', headerName: 'Labels', flex: 1.2 },
    { field: 'genres', headerName: 'Genres', flex: 1 },
    { field: 'styles', headerName: 'Styles', flex: 1.2 },
    {
      field: 'dateAdded',
      headerName: 'Added',
      width: 180,
      valueFormatter: (value) => formatDiscogsDate((value as string) ?? ''),
    },
    {
      field: 'rating',
      headerName: 'Rating',
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
  ];

  useEffect(() => {
    if (!selectedFolder) {
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      setIsLoading(true);

      try {
        const res = await fetch(`/api/discogs?folder=${selectedFolder}`);

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Unknown error');
        }

        setRows(data.collectionOverviewRows);
        markFolderCached(selectedFolder);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setRows([]);
      } finally {
        setLoading(false);
        setIsLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchData();
  }, [selectedFolder, refreshVersion, markFolderCached, setIsLoading, setIsRefreshing]);

  if (error) {
    return (
      <div>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      {selectedFolder && rows.length === 0 && !loading && <p>No records found</p>}

      <main className="h-full">
        <div style={{ height: '100%', width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            columnVisibilityModel={columnVisibilityModel ?? DEFAULT_COLUMN_VISIBILITY}
            getRowId={(row) => `${selectedFolder}-${row.instanceId ?? row.id}`}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25, page: 0 },
              },
              sorting: {
                sortModel: [{ field: 'artist', sort: 'asc' }],
              },
            }}
            loading={loading}
          />
        </div>
      </main>
    </div>
  );
}
