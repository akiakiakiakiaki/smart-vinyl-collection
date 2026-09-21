import { beforeEach, describe, expect, it } from 'vitest';
import { useCollectionStore } from '@/store/useCollectionStore';
import { useReleaseStore } from '@/store/useReleaseStore';
import { useUserStore } from '@/store/useUserStore';
import { useColorModeStore } from '@/store/useColorModeStore';

beforeEach(() => {
  useCollectionStore.setState({
    selectedFolder: '',
    refreshReleasesVersion: 0,
    refreshRatingsVersion: 0,
    cancelRefreshVersion: 0,
    isLoading: false,
    isRefreshing: false,
    ratingSyncFetched: 0,
    ratingSyncTotal: 0,
    ratingSyncEtaSeconds: 0,
    cachedFolders: {},
  });
  useReleaseStore.setState({ refreshVersions: {}, refreshingReleaseIds: {} });
  useUserStore.setState({ user: null });
  useColorModeStore.setState({ mode: 'system' });
});

describe('collection store', () => {
  it('tracks folder selection, cache state and refresh requests', () => {
    const store = useCollectionStore.getState();

    store.setSelectedFolder('CR');
    store.markFolderCached('CR');
    store.triggerReleasesRefresh();
    store.triggerRatingsRefresh();

    expect(useCollectionStore.getState()).toMatchObject({
      selectedFolder: 'CR',
      cachedFolders: { CR: true },
      refreshReleasesVersion: 1,
      refreshRatingsVersion: 1,
      isRefreshing: true,
    });
  });

  it('clears the selected folder and resets rating progress', () => {
    const store = useCollectionStore.getState();

    store.setSelectedFolder('CR');
    store.setRatingSyncProgress(2, 5);
    store.clearFolder();
    store.resetRatingSyncProgress();

    expect(useCollectionStore.getState()).toMatchObject({
      selectedFolder: '',
      ratingSyncFetched: 0,
      ratingSyncTotal: 0,
    });
  });
});

describe('release and user stores', () => {
  it('tracks release refresh state', () => {
    useReleaseStore.getState().triggerReleaseRefresh('100');
    useReleaseStore.getState().setReleaseRefreshing('100', true);

    expect(useReleaseStore.getState()).toMatchObject({
      refreshVersions: { '100': 1 },
      refreshingReleaseIds: { '100': true },
    });
  });

  it('sets and clears the user', () => {
    useUserStore.getState().setUser({ username: 'tester', name: 'Tester', avatar_url: '' });
    expect(useUserStore.getState().user?.username).toBe('tester');

    useUserStore.getState().clearUser();
    expect(useUserStore.getState().user).toBeNull();
  });
});

describe('color mode store', () => {
  it('defaults to the browser system preference and supports explicit modes', () => {
    expect(useColorModeStore.getState().mode).toBe('system');

    useColorModeStore.getState().setMode('dark');
    expect(useColorModeStore.getState().mode).toBe('dark');

    useColorModeStore.getState().resetMode();
    expect(useColorModeStore.getState().mode).toBe('system');
  });
});
