import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FolderSelect } from '@/components/collection/FolderSelect';

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({ folders: [{ id: 1, name: 'CR' }, { id: 2, name: 'Jorge' }] }),
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe('FolderSelect', () => {
  it('uses an empty select value while the folder list is loading', () => {
    fetchMock.mockReturnValueOnce(new Promise<Response>(() => undefined));
    render(<FolderSelect selectedFolder="CR" onChange={vi.fn()} />);

    expect(screen.getByRole('combobox')).toHaveTextContent('Select folder');
  });

  it('restores the selected folder without an out-of-range warning after loading', async () => {
    let resolveFolders: (response: Response) => void = () => undefined;
    fetchMock.mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        resolveFolders = resolve;
      })
    );
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    render(<FolderSelect selectedFolder="CR" onChange={vi.fn()} />);
    expect(screen.getByRole('combobox')).toHaveTextContent('Select folder');

    resolveFolders(
      new Response(JSON.stringify({ folders: [{ id: 1, name: 'CR' }] }), { status: 200 })
    );

    await waitFor(() => expect(screen.getByRole('combobox')).toHaveTextContent('CR'));
    expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining('out-of-range value'));
  });

  it('notifies the parent when a folder is selected', async () => {
    const onChange = vi.fn();
    render(<FolderSelect selectedFolder="" onChange={onChange} />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/discogs?folders=true&refresh=true'));
    await userEvent.click(await screen.findByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: 'Jorge' }));

    expect(onChange).toHaveBeenCalledWith('Jorge');
  });

  it('clears a selected folder that is no longer returned by the API', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ folders: [{ id: 1, name: 'CR' }] }),
    });
    const onChange = vi.fn();
    render(<FolderSelect selectedFolder="Deleted" onChange={onChange} />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/discogs?folders=true&refresh=true'));

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(''));
  });
});
