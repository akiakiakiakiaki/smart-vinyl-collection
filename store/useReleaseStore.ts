import { create } from 'zustand';

type ReleaseState = {
  refreshVersions: Record<string, number>;
  refreshingReleaseIds: Record<string, boolean>;
  triggerReleaseRefresh: (releaseId: string) => void;
  setReleaseRefreshing: (releaseId: string, isRefreshing: boolean) => void;
};

export const useReleaseStore = create<ReleaseState>()((set) => ({
  refreshVersions: {},
  refreshingReleaseIds: {},
  triggerReleaseRefresh: (releaseId) =>
    set((state) => ({
      refreshVersions: {
        ...state.refreshVersions,
        [releaseId]: (state.refreshVersions[releaseId] ?? 0) + 1,
      },
    })),
  setReleaseRefreshing: (releaseId, isRefreshing) =>
    set((state) => ({
      refreshingReleaseIds: {
        ...state.refreshingReleaseIds,
        [releaseId]: isRefreshing,
      },
    })),
}));
