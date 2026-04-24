import { useCollectionStore } from '@/store/useCollectionStore';
import { useShallow } from 'zustand/react/shallow';

export function useCollectionToolbarStore() {
  return useCollectionStore(
    useShallow((s) => ({
      selectedFolder: s.selectedFolder,
      setSelectedFolder: s.setSelectedFolder,
      isLoading: s.isLoading,
      isRefreshing: s.isRefreshing,
      cachedFolders: s.cachedFolders,
      triggerReleasesRefresh: s.triggerReleasesRefresh,
      triggerRatingsRefresh: s.triggerRatingsRefresh,
      cancelRefresh: s.cancelRefresh,
      ratingSyncFetched: s.ratingSyncFetched,
      ratingSyncTotal: s.ratingSyncTotal,
      ratingSyncEtaSeconds: s.ratingSyncEtaSeconds,
      columnVisibilityModel: s.columnVisibilityModel,
      setColumnVisibility: s.setColumnVisibility,
      resetColumnVisibility: s.resetColumnVisibility,
    }))
  );
}
