import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ColumnVisibilityModel, DEFAULT_COLUMN_VISIBILITY } from '../lib/collectionColumns';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
type CollectionState = {
  selectedFolder: string;
  viewMode: 'grid' | 'list';
  refreshReleasesVersion: number;
  refreshRatingsVersion: number;
  cancelRefreshVersion: number;
  isLoading: boolean;
  isRefreshing: boolean;
  ratingSyncFetched: number;
  ratingSyncTotal: number;
  ratingSyncEtaSeconds: number;
  cachedFolders: Record<string, boolean>;
  columnVisibilityModel: ColumnVisibilityModel;
  paginationModel: GridPaginationModel;
  sortModel: GridSortModel;
  hasHydrated: boolean;

  setSelectedFolder: (folder: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsRefreshing: (isRefreshing: boolean) => void;
  setRatingSyncProgress: (fetched: number, total: number) => void;
  setRatingSyncEtaSeconds: (seconds: number) => void;
  setPaginationModel: (model: GridPaginationModel) => void;
  setSortModel: (model: GridSortModel) => void;
  setHasHydrated: (hydrated: boolean) => void;
  tickRatingSyncEtaSeconds: () => void;
  resetRatingSyncProgress: () => void;
  markFolderCached: (folder: string) => void;
  triggerReleasesRefresh: () => void;
  triggerRatingsRefresh: () => void;
  cancelRefresh: () => void;
  setColumnVisibility: (field: keyof ColumnVisibilityModel, visible: boolean) => void;
  resetColumnVisibility: () => void;

  clearFolder: () => void;
};

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set) => ({
      selectedFolder: '',
      viewMode: 'grid',
      refreshReleasesVersion: 0,
      refreshRatingsVersion: 0,
      cancelRefreshVersion: 0,
      isLoading: false,
      isRefreshing: false,
      ratingSyncFetched: 0,
      ratingSyncTotal: 0,
      ratingSyncEtaSeconds: 0,
      cachedFolders: {},
      columnVisibilityModel: DEFAULT_COLUMN_VISIBILITY,
      paginationModel: { page: 0, pageSize: 25 },
      sortModel: [{ field: 'artist', sort: 'asc' }],
      hasHydrated: false,

      setSelectedFolder: (folder) => set({ selectedFolder: folder }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setIsRefreshing: (isRefreshing) => set({ isRefreshing }),
      setRatingSyncProgress: (fetched, total) => set({ ratingSyncFetched: fetched, ratingSyncTotal: total }),
      setRatingSyncEtaSeconds: (seconds) => set({ ratingSyncEtaSeconds: Math.max(0, seconds) }),
      setPaginationModel: (model) =>
        set((state) => {
          if (state.paginationModel.page === model.page && state.paginationModel.pageSize === model.pageSize) {
            return state;
          }
          return { paginationModel: model };
        }),

      setSortModel: (model) =>
        set((state) => {
          if (JSON.stringify(state.sortModel) === JSON.stringify(model)) {
            return state;
          }
          return { sortModel: model };
        }),

      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
      tickRatingSyncEtaSeconds: () =>
        set((state) => ({
          ratingSyncEtaSeconds: Math.max(0, state.ratingSyncEtaSeconds - 1),
        })),
      resetRatingSyncProgress: () => set({ ratingSyncFetched: 0, ratingSyncTotal: 0, ratingSyncEtaSeconds: 0 }),
      markFolderCached: (folder) =>
        set((state) => ({
          cachedFolders: {
            ...state.cachedFolders,
            [folder]: true,
          },
        })),
      triggerReleasesRefresh: () => set((state) => ({ refreshReleasesVersion: state.refreshReleasesVersion + 1 })),
      triggerRatingsRefresh: () =>
        set((state) => ({
          refreshRatingsVersion: state.refreshRatingsVersion + 1,
          isRefreshing: true,
          ratingSyncFetched: 0,
          ratingSyncTotal: 0,
          ratingSyncEtaSeconds: 0,
        })),
      cancelRefresh: () =>
        set((state) => ({
          cancelRefreshVersion: state.cancelRefreshVersion + 1,
          isRefreshing: false,
        })),
      setColumnVisibility: (field, visible) =>
        set((state) => ({
          columnVisibilityModel: {
            ...state.columnVisibilityModel,
            [field]: visible,
          },
        })),
      resetColumnVisibility: () => set({ columnVisibilityModel: DEFAULT_COLUMN_VISIBILITY }),

      clearFolder: () => set({ selectedFolder: '' }),
    }),
    {
      name: 'collection-storage',
      partialize: (state) => ({
        selectedFolder: state.selectedFolder,
        viewMode: state.viewMode,
        cachedFolders: state.cachedFolders,
        columnVisibilityModel: state.columnVisibilityModel,
        paginationModel: state.paginationModel,
        sortModel: state.sortModel,
      }),

      onRehydrateStorage: () => (state?: CollectionState) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
