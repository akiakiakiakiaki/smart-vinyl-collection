import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CollectionState = {
  selectedFolder: string;
  viewMode: 'grid' | 'list';

  setSelectedFolder: (folder: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;

  clearFolder: () => void;
};

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set) => ({
      selectedFolder: '',
      viewMode: 'grid',

      setSelectedFolder: (folder) => set({ selectedFolder: folder }),
      setViewMode: (mode) => set({ viewMode: mode }),

      clearFolder: () => set({ selectedFolder: '' }),
    }),
    {
      name: 'collection-storage',
    }
  )
);
