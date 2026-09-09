'use client';

import { useCollectionStore } from '@/store/useCollectionStore';
import { useCollectionData } from '@/hooks/collection/useCollectionData';
import { useRatingSync } from '@/hooks/collection/useRatingSync';
import { CollectionDataGrid } from '@/components/collection/CollectionDataGrid';

export default function CollectionOverview() {
  const selectedFolder = useCollectionStore((s) => s.selectedFolder);
  const columnVisibilityModel = useCollectionStore((s) => s.columnVisibilityModel);

  const { rows, setRows, loading, error, fetchReleaseDetails } = useCollectionData(selectedFolder);

  useRatingSync(selectedFolder, rows, setRows);

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
      <h1 className="sr-only">Collection overview</h1>
      {selectedFolder && rows.length === 0 && !loading && <p>No records found</p>}

      <div className="h-full">
        <CollectionDataGrid
          rows={rows}
          loading={loading}
          selectedFolder={selectedFolder}
          columnVisibilityModel={columnVisibilityModel}
          onFetchReleaseDetails={fetchReleaseDetails}
        />
      </div>
    </div>
  );
}
