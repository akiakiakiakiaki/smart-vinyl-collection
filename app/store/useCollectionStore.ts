import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ColumnVisibilityModel, DEFAULT_COLUMN_VISIBILITY } from '../lib/collectionColumns';

type CollectionState = {
  selectedFolder: string;
  viewMode: 'grid' | 'list';
  refreshVersion: number;
  isLoading: boolean;
  isRefreshing: boolean;
  cachedFolders: Record<string, boolean>;
  columnVisibilityModel: ColumnVisibilityModel;

  setSelectedFolder: (folder: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsRefreshing: (isRefreshing: boolean) => void;
  markFolderCached: (folder: string) => void;
  triggerRefresh: () => void;
  setColumnVisibility: (field: keyof ColumnVisibilityModel, visible: boolean) => void;
  resetColumnVisibility: () => void;

  clearFolder: () => void;
};

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set) => ({
      selectedFolder: '',
      viewMode: 'grid',
      refreshVersion: 0,
      isLoading: false,
      isRefreshing: false,
      cachedFolders: {},
      columnVisibilityModel: DEFAULT_COLUMN_VISIBILITY,

      setSelectedFolder: (folder) => set({ selectedFolder: folder }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setIsRefreshing: (isRefreshing) => set({ isRefreshing }),
      markFolderCached: (folder) =>
        set((state) => ({
          cachedFolders: {
            ...state.cachedFolders,
            [folder]: true,
          },
        })),
      triggerRefresh: () => set((state) => ({ refreshVersion: state.refreshVersion + 1 })),
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
    }
  )
);
