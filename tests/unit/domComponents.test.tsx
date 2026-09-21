import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColumnPopover } from '@/components/collection/ColumnPopover';
import UserInfo from '@/components/UserInfo';
import { ReleaseToolbar } from '@/components/releases/ReleaseToolbar';
import { CollectionToolbar } from '@/components/collection/CollectionToolbar';
import { useCollectionStore } from '@/store/useCollectionStore';
import { useReleaseStore } from '@/store/useReleaseStore';
import { useUserStore } from '@/store/useUserStore';

const useParamsMock = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => useParamsMock(),
}));

vi.mock('@/components/collection/FolderSelect', () => ({
  FolderSelect: () => <div data-testid="folder-select" />,
}));

vi.mock('@/components/collection/RatingSyncButton', () => ({
  RatingSyncButton: ({ onStart, onCancel }: { onStart: () => void; onCancel: () => void }) => (
    <div data-testid="rating-sync-button">
      <button type="button" onClick={onStart}>Start rating refresh</button>
      <button type="button" onClick={onCancel}>Cancel rating refresh</button>
    </div>
  ),
}));

const defaultColumnVisibility = {
  cover: true,
  artist: true,
  displayTitle: true,
  year: true,
  formats: false,
  labels: false,
  genres: false,
  styles: false,
  lowestPrice: false,
  dateAdded: false,
  rating: false,
};

beforeEach(() => {
  useCollectionStore.setState({
    selectedFolder: '',
    refreshReleasesVersion: 0,
    refreshRatingsVersion: 0,
    isLoading: false,
    isRefreshing: false,
    cachedFolders: {},
    columnVisibilityModel: defaultColumnVisibility,
  });
  useReleaseStore.setState({ refreshVersions: {}, refreshingReleaseIds: {} });
  useUserStore.setState({ user: null });
});

afterEach(() => {
  document.body.innerHTML = '';
  vi.clearAllMocks();
});

describe('ColumnPopover', () => {
  it('toggles columns and resets the visibility model', async () => {
    const anchor = document.createElement('button');
    document.body.append(anchor);
    const onToggle = vi.fn();
    const onReset = vi.fn();

    render(
      <ColumnPopover
        open
        anchorEl={anchor}
        onClose={vi.fn()}
        columnVisibilityModel={defaultColumnVisibility}
        onToggle={onToggle}
        onReset={onReset}
      />
    );

    await userEvent.click(screen.getByRole('checkbox', { name: 'Formats' }));
    expect(onToggle).toHaveBeenCalledWith('formats');

    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(onReset).toHaveBeenCalledOnce();
  });
});

describe('UserInfo', () => {
  it('renders nothing when no user is present', () => {
    render(<UserInfo />);

    expect(screen.queryByText(/tester/i)).not.toBeInTheDocument();
  });

  it('renders the display name and username', () => {
    useUserStore.setState({ user: { username: 'tester', name: 'Test User', avatar_url: '' } });

    render(<UserInfo />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('(tester)')).toBeInTheDocument();
  });
});

describe('ReleaseToolbar', () => {
  it('links back to the collection and triggers a release refresh', async () => {
    useParamsMock.mockReturnValue({ releaseId: '100' });
    render(<ReleaseToolbar />);

    expect(screen.getByRole('link', { name: 'Back to collection' })).toHaveAttribute('href', '/collection/overview');
    await userEvent.click(screen.getByRole('button', { name: 'Refresh Release' }));

    expect(useReleaseStore.getState().refreshVersions['100']).toBe(1);
  });

  it('disables refresh while the release is refreshing', () => {
    useParamsMock.mockReturnValue({ releaseId: '100' });
    useReleaseStore.setState({ refreshingReleaseIds: { '100': true } });
    render(<ReleaseToolbar />);

    expect(screen.getByRole('button', { name: 'Refreshing Release' })).toBeDisabled();
  });
});

describe('CollectionToolbar', () => {
  it('enables release refresh only for a cached selected folder', async () => {
    useCollectionStore.setState({ selectedFolder: 'CR', cachedFolders: { CR: true } });
    render(<CollectionToolbar />);

    const refreshButton = screen.getByRole('button', { name: 'Refresh Releases' });
    expect(refreshButton).toBeEnabled();

    await userEvent.click(refreshButton);
    expect(useCollectionStore.getState().refreshReleasesVersion).toBe(1);
  });

  it('keeps release refresh disabled when the folder is not cached or loading', () => {
    useCollectionStore.setState({ selectedFolder: 'CR', cachedFolders: {} });
    render(<CollectionToolbar />);

    expect(screen.getByRole('button', { name: 'Refresh Releases' })).toBeDisabled();
  });

  it('opens the column controls and reports the visible column count', async () => {
    render(<CollectionToolbar />);

    expect(screen.getByText('4/11')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Show or hide columns' }));
    expect(screen.getAllByText('Columns')).toHaveLength(2);
    expect(screen.getByRole('checkbox', { name: 'Cover' })).toBeChecked();
  });

  it('starts and cancels a rating refresh for a cached folder', async () => {
    useCollectionStore.setState({ selectedFolder: 'CR', cachedFolders: { CR: true } });
    render(<CollectionToolbar />);

    await userEvent.click(screen.getByRole('button', { name: 'Start rating refresh' }));
    expect(useCollectionStore.getState().refreshRatingsVersion).toBe(1);

    await userEvent.click(screen.getByRole('button', { name: 'Cancel rating refresh' }));
    expect(useCollectionStore.getState().cancelRefreshVersion).toBe(1);
  });

  it('ignores a rating refresh request when no cached folder is selected', async () => {
    render(<CollectionToolbar />);

    await userEvent.click(screen.getByRole('button', { name: 'Start rating refresh' }));

    expect(useCollectionStore.getState().refreshRatingsVersion).toBe(0);
  });

  it('toggles a column and closes the column popover', async () => {
    render(<CollectionToolbar />);

    await userEvent.click(screen.getByRole('button', { name: 'Show or hide columns' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Formats' }));

    expect(useCollectionStore.getState().columnVisibilityModel.formats).toBe(true);
  });
});
