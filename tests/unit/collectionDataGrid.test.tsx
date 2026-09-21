import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { GridColDef, GridRenderCellParams, GridSortModel } from '@mui/x-data-grid';
import { CollectionDataGrid } from '@/components/collection/CollectionDataGrid';
import { useCollectionStore } from '@/store/useCollectionStore';
import { CollectionOverviewRow } from '@/types/collection';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <span role="img" aria-label={alt} data-src={src} />
  ),
}));

vi.mock('@mui/x-data-grid', async () => {
  const actual = await vi.importActual<typeof import('@mui/x-data-grid')>('@mui/x-data-grid');

  type MockDataGridProps = {
    rows: CollectionOverviewRow[];
    columns: GridColDef[];
    loading: boolean;
    columnVisibilityModel: Record<string, boolean>;
    getRowId: (row: CollectionOverviewRow) => string;
    onRowClick: (params: { row: CollectionOverviewRow }) => void;
    onPaginationModelChange: (model: { page: number; pageSize: number }) => void;
    onSortModelChange: (model: GridSortModel) => void;
    localeText?: { noRowsLabel?: string };
  };

  function MockDataGrid({
    rows,
    columns,
    loading,
    columnVisibilityModel,
    getRowId,
    onRowClick,
    onPaginationModelChange,
    onSortModelChange,
    localeText,
  }: MockDataGridProps) {
    const visibleColumns = columns.filter((column) => columnVisibilityModel[column.field] !== false);

    return (
      <div data-testid="data-grid" data-loading={String(loading)}>
        <div data-testid="visible-columns">{visibleColumns.map((column) => column.field).join(',')}</div>
        {rows.map((row) => (
          <div
            key={getRowId(row)}
            data-testid={`row-${getRowId(row)}`}
            onClick={() => onRowClick({ row })}
          >
            {visibleColumns.map((column) => {
              const value = row[column.field as keyof CollectionOverviewRow];
              let rendered: React.ReactNode;
              if (column.renderCell) {
                rendered = column.renderCell({
                  value,
                  row,
                } as GridRenderCellParams);
              } else if (column.valueFormatter) {
                const valueFormatter = column.valueFormatter as unknown as (
                  value: unknown,
                  row: CollectionOverviewRow,
                  column: GridColDef,
                  apiRef: never
                ) => unknown;
                rendered = valueFormatter(value, row, column, {} as never) as React.ReactNode;
              } else {
                rendered = String(value ?? '');
              }

              return <span key={column.field}>{rendered}</span>;
            })}
          </div>
        ))}
        {rows.length === 0 && <div data-testid="no-rows-label">{localeText?.noRowsLabel}</div>}
        <button type="button" onClick={() => onPaginationModelChange({ page: 1, pageSize: 10 })}>
          Change page
        </button>
        <button type="button" onClick={() => onSortModelChange([{ field: 'year', sort: 'desc' }])}>
          Change sort
        </button>
        <button
          type="button"
          onClick={() => {
            const priceColumn = columns.find((column) => column.field === 'lowestPrice');
            const ratingColumn = columns.find((column) => column.field === 'rating');
            document.body.dataset.priceSort = String(priceColumn?.sortComparator?.(null, 10, undefined as never, undefined as never));
            document.body.dataset.ratingSort = String(ratingColumn?.sortComparator?.(null, 3, undefined as never, undefined as never));
          }}
        >
          Compare values
        </button>
      </div>
    );
  }

  return { ...actual, DataGrid: MockDataGrid };
});

const baseRow: CollectionOverviewRow = {
  id: 100,
  instanceId: 200,
  title: 'Test Album',
  displayTitle: 'Test Album',
  artist: 'Test Artist',
  year: 2026,
  dateAdded: '2026-01-02T12:00:00Z',
  formats: 'Vinyl / LP',
  cover: 'https://example.com/cover.jpg',
  rating: 4,
  lowestPrice: null,
  releaseDetailsLoaded: false,
  labels: 'Test Label',
  genres: 'Electronic',
  styles: 'House',
};

const visibleColumns = {
  cover: true,
  artist: true,
  displayTitle: true,
  year: true,
  formats: true,
  labels: true,
  genres: true,
  styles: true,
  lowestPrice: true,
  dateAdded: true,
  rating: true,
};

beforeEach(() => {
  pushMock.mockReset();
  useCollectionStore.setState({
    hasHydrated: true,
    paginationModel: { page: 0, pageSize: 25 },
    sortModel: [{ field: 'artist', sort: 'asc' }],
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('CollectionDataGrid', () => {
  it('does not render before the collection store has hydrated', () => {
    useCollectionStore.setState({ hasHydrated: false });

    render(
      <CollectionDataGrid
        rows={[baseRow]}
        loading={false}
        selectedFolder="CR"
        columnVisibilityModel={visibleColumns}
        onFetchReleaseDetails={vi.fn()}
      />
    );

    expect(screen.queryByTestId('data-grid')).not.toBeInTheDocument();
  });

  it('renders rows, loading state and configured visible columns', () => {
    render(
      <CollectionDataGrid
        rows={[baseRow]}
        loading
        selectedFolder="CR"
        columnVisibilityModel={visibleColumns}
        onFetchReleaseDetails={vi.fn()}
      />
    );

    expect(screen.getByTestId('data-grid')).toHaveAttribute('data-loading', 'true');
    expect(screen.getByTestId('row-CR-200')).toBeInTheDocument();
    expect(screen.getByTestId('visible-columns')).toHaveTextContent('cover,artist,displayTitle,year,formats');
    expect(screen.getByText('Test Album')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'cover' })).toHaveAttribute('data-src', baseRow.cover);
  });

  it('navigates to the release when a row is clicked', async () => {
    render(
      <CollectionDataGrid
        rows={[baseRow]}
        loading={false}
        selectedFolder="CR"
        columnVisibilityModel={visibleColumns}
        onFetchReleaseDetails={vi.fn()}
      />
    );

    await userEvent.click(screen.getByTestId('row-CR-200'));

    expect(pushMock).toHaveBeenCalledWith('/collection/releases/100');
  });

  it('fetches missing release details from the price cell', async () => {
    const onFetchReleaseDetails = vi.fn().mockResolvedValue(undefined);

    render(
      <CollectionDataGrid
        rows={[baseRow]}
        loading={false}
        selectedFolder="CR"
        columnVisibilityModel={visibleColumns}
        onFetchReleaseDetails={onFetchReleaseDetails}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Fetch release details' }));

    expect(onFetchReleaseDetails).toHaveBeenCalledWith(100);
  });

  it('renders the formatted price and rating when details are available', () => {
    render(
      <CollectionDataGrid
        rows={[{ ...baseRow, lowestPrice: 12.5, releaseDetailsLoaded: true }]}
        loading={false}
        selectedFolder="CR"
        columnVisibilityModel={visibleColumns}
        onFetchReleaseDetails={vi.fn()}
      />
    );

    expect(screen.getByText('$12.50')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'cover' })).toBeInTheDocument();
  });

  it('shows a dash when release details are loaded without a price', () => {
    render(
      <CollectionDataGrid
        rows={[{ ...baseRow, lowestPrice: null, releaseDetailsLoaded: true }]}
        loading={false}
        selectedFolder="CR"
        columnVisibilityModel={visibleColumns}
        onFetchReleaseDetails={vi.fn()}
      />
    );

    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Fetch release details' })).not.toBeInTheDocument();
  });

  it('disables the release details button while fetching', async () => {
    let resolveFetch: () => void = () => undefined;
    const onFetchReleaseDetails = vi.fn(
      () => new Promise<void>((resolve) => {
        resolveFetch = resolve;
      })
    );

    render(
      <CollectionDataGrid
        rows={[baseRow]}
        loading={false}
        selectedFolder="CR"
        columnVisibilityModel={visibleColumns}
        onFetchReleaseDetails={onFetchReleaseDetails}
      />
    );

    const button = screen.getByRole('button', { name: 'Fetch release details' });
    await userEvent.click(button);

    expect(button).toBeDisabled();
    resolveFetch();
  });

  it('renders fallback values for missing cover, date and rating', () => {
    render(
      <CollectionDataGrid
        rows={[{ ...baseRow, cover: null, dateAdded: '', rating: null }]}
        loading={false}
        selectedFolder="CR"
        columnVisibilityModel={visibleColumns}
        onFetchReleaseDetails={vi.fn()}
      />
    );

    expect(screen.queryByRole('img', { name: 'cover' })).not.toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('re-enables the details button after a failed fetch', async () => {
    const onFetchReleaseDetails = vi.fn().mockRejectedValue(new Error('Details unavailable'));

    render(
      <CollectionDataGrid
        rows={[baseRow]}
        loading={false}
        selectedFolder="CR"
        columnVisibilityModel={visibleColumns}
        onFetchReleaseDetails={onFetchReleaseDetails}
      />
    );

    const button = screen.getByRole('button', { name: 'Fetch release details' });
    await userEvent.click(button);
    await screen.findByRole('button', { name: 'Fetch release details' });

    expect(button).toBeEnabled();
  });

  it('forwards pagination and sort changes to the collection store', async () => {
    render(
      <CollectionDataGrid
        rows={[]}
        loading={false}
        selectedFolder="CR"
        columnVisibilityModel={visibleColumns}
        onFetchReleaseDetails={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Change page' }));
    await userEvent.click(screen.getByRole('button', { name: 'Change sort' }));

    expect(useCollectionStore.getState().paginationModel).toEqual({ page: 1, pageSize: 10 });
    expect(useCollectionStore.getState().sortModel).toEqual([{ field: 'year', sort: 'desc' }]);
  });

  it('passes the translated empty-state label to the data grid', () => {
    render(
      <CollectionDataGrid
        rows={[]}
        loading={false}
        selectedFolder="CR"
        columnVisibilityModel={visibleColumns}
        onFetchReleaseDetails={vi.fn()}
      />
    );

    expect(screen.getByTestId('no-rows-label')).toHaveTextContent('No records found');
  });

  it('uses a fallback id when a row has no instance id', () => {
    render(
      <CollectionDataGrid
        rows={[{ ...baseRow, id: 100, instanceId: null }, { ...baseRow, id: 101, instanceId: null }]}
        loading={false}
        selectedFolder="CR"
        columnVisibilityModel={visibleColumns}
        onFetchReleaseDetails={vi.fn()}
      />
    );

    expect(screen.getByTestId('row-CR-100')).toBeInTheDocument();
    expect(screen.getByTestId('row-CR-101')).toBeInTheDocument();
  });

  it('formats the added date and sorts missing prices and ratings last', async () => {
    render(
      <CollectionDataGrid
        rows={[baseRow]}
        loading={false}
        selectedFolder="CR"
        columnVisibilityModel={{ ...visibleColumns, dateAdded: true }}
        onFetchReleaseDetails={vi.fn()}
      />
    );

    expect(screen.getByText(/Jan 2, 2026/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Compare values' }));
    expect(document.body.dataset.priceSort).toBe('Infinity');
    expect(document.body.dataset.ratingSort).toBe('-4');
  });
});
