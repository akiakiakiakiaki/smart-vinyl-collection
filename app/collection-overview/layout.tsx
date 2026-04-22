'use client';

import { useEffect, useState } from 'react';
import { Select, MenuItem, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DiscogsFolder } from '../types/discogs';
import { useCollectionStore } from '../store/useCollectionStore';

export default function CollectionLayout({ children }: { children: React.ReactNode }) {
  const selectedFolder = useCollectionStore((s) => s.selectedFolder);
  const setSelectedFolder = useCollectionStore((s) => s.setSelectedFolder);

  const [folders, setFolders] = useState<DiscogsFolder[]>([]);

  useEffect(() => {
    const fetchFolders = async () => {
      const res = await fetch('/api/discogs?folder=CR');

      const data = await res.json();
      if (res.ok) {
        setFolders(data.folders);
      }
    };

    fetchFolders();
  }, []);

  const handleRefresh = async () => {
    if (!selectedFolder) return;

    const res = await fetch(`/api/discogs?folder=${selectedFolder}&refresh=true`);

    if (res.status === 401) {
      // Do not auto-redirect. Let root page handle auth.
      return;
    }

    // Trigger re-fetch indirectly by resetting folder
    setSelectedFolder(selectedFolder);
  };

  return (
    <div className="flex flex-col h-full p-5">
      <header className="flex mb-4">
        <Select
          value={selectedFolder}
          displayEmpty
          renderValue={(value) => (value ? (value as string) : <em>Select folder</em>)}
          onChange={(e) => setSelectedFolder(e.target.value)}
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
          style={{ marginLeft: 10 }}
        >
          Refresh
        </Button>
      </header>

      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
