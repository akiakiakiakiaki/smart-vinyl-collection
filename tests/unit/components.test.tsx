import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FolderSelect } from '@/components/collection/FolderSelect';
import { RatingSyncButton } from '@/components/collection/RatingSyncButton';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('FolderSelect', () => {
  it('loads and displays folders from the API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ folders: [{ id: 1, name: 'CR' }] }), { status: 200 })
      )
    );

    render(<FolderSelect selectedFolder={null} onChange={vi.fn()} />);

    expect(await screen.findByRole('combobox')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('option', { name: 'CR' })).toBeInTheDocument();
  });

  it('clears a selected folder that is absent from the refreshed list', async () => {
    const onChange = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ folders: [{ id: 1, name: 'CR' }] }), { status: 200 }))
    );

    render(<FolderSelect selectedFolder="Deleted" onChange={onChange} />);

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(''));
  });

  it('refetches folders after cache invalidation', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ folders: [{ id: 1, name: 'CR' }] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ folders: [] }), { status: 200 }));
    const onChange = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(<FolderSelect selectedFolder="CR" onChange={onChange} />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    window.dispatchEvent(new Event('discogs-folders-invalidated'));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(onChange).toHaveBeenCalledWith('');
  });
});

describe('RatingSyncButton', () => {
  it('starts a rating refresh when enabled', async () => {
    const onStart = vi.fn();
    render(
      <RatingSyncButton
        isRefreshing={false}
        isLoading={false}
        selectedFolder="CR"
        onStart={onStart}
        onCancel={vi.fn()}
        fetched={0}
        total={0}
        etaSeconds={0}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Refresh Ratings' }));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it('shows progress and cancels an active refresh', async () => {
    const onCancel = vi.fn();
    render(
      <RatingSyncButton
        isRefreshing
        isLoading={false}
        selectedFolder="CR"
        onStart={vi.fn()}
        onCancel={onCancel}
        fetched={2}
        total={5}
        etaSeconds={65}
      />
    );

    expect(screen.getByRole('button', { name: /Cancel Refresh Ratings \(2\/5, 01:05\)/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Cancel Refresh Ratings/ }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('disables rating refresh without a folder or while loading', () => {
    const { rerender } = render(
      <RatingSyncButton
        isRefreshing={false}
        isLoading={false}
        selectedFolder={null}
        onStart={vi.fn()}
        onCancel={vi.fn()}
        fetched={0}
        total={0}
        etaSeconds={0}
      />
    );

    expect(screen.getByRole('button', { name: 'Refresh Ratings' })).toBeDisabled();

    rerender(
      <RatingSyncButton
        isRefreshing={false}
        isLoading
        selectedFolder="CR"
        onStart={vi.fn()}
        onCancel={vi.fn()}
        fetched={0}
        total={0}
        etaSeconds={0}
      />
    );

    expect(screen.getByRole('button', { name: 'Refresh Ratings' })).toBeDisabled();
  });
});
