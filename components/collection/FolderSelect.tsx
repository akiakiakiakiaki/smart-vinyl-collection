'use client';

import { useEffect, useState } from 'react';
import { Select, MenuItem } from '@mui/material';
import { DiscogsFolder } from '@/types/discogs';

type Props = {
  selectedFolder: string | null;
  onChange: (folder: string) => void;
};

export function FolderSelect({ selectedFolder, onChange }: Props) {
  const [folders, setFolders] = useState<DiscogsFolder[]>([]);

  useEffect(() => {
    const fetchFolders = async () => {
      const res = await fetch('/api/discogs?folders=true&refresh=true');
      const data = await res.json();

      if (res.ok) {
        setFolders(data.folders);
      }
    };

    void fetchFolders();

    const handleFoldersInvalidated = () => {
      void fetchFolders();
    };

    window.addEventListener('discogs-folders-invalidated', handleFoldersInvalidated);
    return () => window.removeEventListener('discogs-folders-invalidated', handleFoldersInvalidated);
  }, []);

  useEffect(() => {
    if (folders.length > 0 && selectedFolder && !folders.some((folder) => folder.name === selectedFolder)) {
      onChange('');
    }
  }, [folders, onChange, selectedFolder]);

  const selectedFolderExists = folders.some((folder) => folder.name === selectedFolder);
  const selectValue = selectedFolderExists ? selectedFolder : '';

  return (
    <Select
      size="small"
      value={selectValue}
      displayEmpty
      renderValue={(value) => (value ? (value as string) : <em>Select folder</em>)}
      onChange={(e) => {
        const value = e.target.value;
        if (!value) return;
        onChange(value);
      }}
      className="py-0 my-0"
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
  );
}
