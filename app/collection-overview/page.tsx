'use client';

import { useState, useEffect } from 'react';
import { DiscogsFolder } from '../types/discogs';
import { RecordItem } from '../types/collection';

import { Select, MenuItem, Box, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import { useCollectionStore } from '../store/useCollectionStore';

export default function HomePage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [folders, setFolders] = useState<DiscogsFolder[]>([]);

  // resolves hidration problems
  const selectedFolder = useCollectionStore((s) => s.selectedFolder);
  const setSelectedFolder = useCollectionStore((s) => s.setSelectedFolder);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch folders on initial load (independent of selectedFolder)
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        // use a fallback folder to retrieve folder list
        const res = await fetch('/api/discogs?folder=CR');
        const data = await res.json();

        if (res.ok) {
          setFolders(data.folders);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchFolders();
  }, []);

  const handleRefresh = async () => {
    if (!selectedFolder) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/discogs?folder=${selectedFolder}&refresh=true`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Unknown error');
      }

      setRecords(data.records);
      setFolders(data.folders);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

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
        setFolders(data.folders);
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

  if (error)
    return (
      <div>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );

  return (
    <div className="flex flex-col p-5 h-screen">
      {selectedFolder && records.length === 0 && !loading && <p>No records found</p>}

      <header className="flex">
        <Select
          value={selectedFolder}
          displayEmpty
          renderValue={(value) => (value ? (value as string) : <em>Select folder</em>)}
          onChange={(e) => {
            setSelectedFolder(e.target.value);
          }}
          style={{ marginBottom: 20 }}
        >
          {folders.map((f) => (
            <MenuItem
              key={f.id}
              value={f.name}
            >
              {f.name}
            </MenuItem>
          ))}
        </Select>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          style={{ marginLeft: 10, marginBottom: 20 }}
        >
          Refresh
        </Button>
      </header>
      <main className="overflow-hidden">
        <Box style={{ height: '100%', width: '100%' }}>
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
        </Box>
      </main>
    </div>
  );
}
