'use client';

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Rating from '@mui/material/Rating';

import { formatDiscogsDate } from '@/lib/formatUtils';
import { DEFAULT_COLUMN_VISIBILITY } from '@/lib/collectionColumns';
import { CollectionOverviewRow } from '@/types/collection';

type Props = {
  rows: CollectionOverviewRow[];
  loading: boolean;
  selectedFolder: string | null;
  columnVisibilityModel: Record<string, boolean>;
};

export function CollectionDataGrid({ rows, loading, selectedFolder, columnVisibilityModel }: Props) {
  const router = useRouter();

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
              loading="eager"
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

  return (
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
