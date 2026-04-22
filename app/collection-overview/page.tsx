'use client';

import { useState, useEffect } from 'react';
import { RecordItem } from '../types/collection';

import { DataGrid, GridColDef } from '@mui/x-data-grid';

import { useCollectionStore } from '../store/useCollectionStore';

export default function HomePage() {
  const [records, setRecords] = useState<RecordItem[]>([]);

  // resolves hidration problems
  const selectedFolder = useCollectionStore((s) => s.selectedFolder);

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
          <img
            src={params.value as string}
            alt="cover"
            width={50}
          />
        ) : null,
    },
    { field: 'artist', headerName: 'Artist', flex: 1 },
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'year', headerName: 'Year', width: 120 },
  ];

  useEffect(() => {
    if (!selectedFolder) {
      return;
    }
    const fetchData = async () => {
      setLoading(true);

      try {
        const res = await fetch(`/api/discogs?folder=${selectedFolder}`);

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Unknown error');
        }

        setRecords(data.records);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedFolder]);

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
      {selectedFolder && records.length === 0 && !loading && <p>No records found</p>}

      <main className="h-full">
        <div style={{ height: '100%', width: '100%' }}>
          <DataGrid
            rows={records}
            columns={columns}
            getRowId={(row) => `${selectedFolder}-${row.id}`}
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
