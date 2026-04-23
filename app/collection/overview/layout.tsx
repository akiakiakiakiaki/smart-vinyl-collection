'use client';

import { useEffect, useState } from 'react';
import {
  Select,
  MenuItem,
  Button,
  Popover,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
  Tooltip,
  Chip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { DiscogsFolder } from '@/types/discogs';
import { COLLECTION_COLUMN_OPTIONS, DEFAULT_COLUMN_VISIBILITY } from '@/lib/collectionColumns';
import { useCollectionStore } from '@/store/useCollectionStore';

export default function CollectionLayout({ children }: { children: React.ReactNode }) {
  const selectedFolder = useCollectionStore((s) => s.selectedFolder);
  const setSelectedFolder = useCollectionStore((s) => s.setSelectedFolder);
  const isLoading = useCollectionStore((s) => s.isLoading);
  const isRefreshing = useCollectionStore((s) => s.isRefreshing);
  const cachedFolders = useCollectionStore((s) => s.cachedFolders);
  const setIsRefreshing = useCollectionStore((s) => s.setIsRefreshing);
  const triggerRefresh = useCollectionStore((s) => s.triggerRefresh);
  const columnVisibilityModel = useCollectionStore((s) => s.columnVisibilityModel);
  const setColumnVisibility = useCollectionStore((s) => s.setColumnVisibility);
  const resetColumnVisibility = useCollectionStore((s) => s.resetColumnVisibility);

  const [folders, setFolders] = useState<DiscogsFolder[]>([]);
  const [columnAnchorEl, setColumnAnchorEl] = useState<HTMLButtonElement | null>(null);

  const canRefresh = Boolean(selectedFolder) && Boolean(cachedFolders[selectedFolder]) && !isLoading && !isRefreshing;
  const columnsOpen = Boolean(columnAnchorEl);
  const selectedFolderExists = folders.some((folder) => folder.name === selectedFolder);
  const selectValue = selectedFolderExists ? selectedFolder : '';
  const visibleColumnCount = COLLECTION_COLUMN_OPTIONS.filter((column) => columnVisibilityModel[column.field]).length;
  const isDefaultColumnLayout = COLLECTION_COLUMN_OPTIONS.every(
    (column) => columnVisibilityModel[column.field] === DEFAULT_COLUMN_VISIBILITY[column.field]
  );

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
    if (!canRefresh) return;

    setIsRefreshing(true);

    try {
      const res = await fetch(`/api/discogs?folder=${selectedFolder}&refresh=true`);

      if (res.status === 401 || !res.ok) {
        setIsRefreshing(false);
        return;
      }

      triggerRefresh();
    } catch {
      setIsRefreshing(false);
    }
  };

  const handleToggleColumn = (field: (typeof COLLECTION_COLUMN_OPTIONS)[number]['field']) => {
    setColumnVisibility(field, !columnVisibilityModel[field]);
  };

  return (
    <div className="flex flex-col h-full p-5">
      <header className="mb-4 flex items-center gap-2">
        <Select
          size="small"
          value={selectValue}
          displayEmpty
          renderValue={(value) => (value ? (value as string) : <em>Select folder</em>)}
          onChange={(e) => setSelectedFolder(e.target.value)}
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
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={!canRefresh}
        >
          Refresh from Discogs
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Tooltip title="Show or hide columns">
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

        <Popover
          open={columnsOpen}
          anchorEl={columnAnchorEl}
          onClose={() => setColumnAnchorEl(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Box sx={{ p: 2, minWidth: 220 }}>
            <div className="mb-2 flex items-center justify-between">
              <strong>Columns</strong>
              <Button
                size="small"
                startIcon={<RestartAltIcon />}
                onClick={resetColumnVisibility}
              >
                Reset
              </Button>
            </div>

            <FormGroup>
              {COLLECTION_COLUMN_OPTIONS.map((column) => (
                <FormControlLabel
                  key={column.field}
                  control={
                    <Checkbox
                      checked={columnVisibilityModel[column.field]}
                      onChange={() => handleToggleColumn(column.field)}
                    />
                  }
                  label={column.label}
                />
              ))}
            </FormGroup>
          </Box>
        </Popover>
      </header>

      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
