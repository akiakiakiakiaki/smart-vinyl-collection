import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('FolderSelect', () => {
  it('notifies the parent when a folder is selected', async () => {
    const onChange = vi.fn();
    render(<FolderSelect selectedFolder="" onChange={onChange} />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/discogs?folders=true&refresh=true'));
    await userEvent.click(screen.getByRole('combobox'));
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

    await waitForSelectionLoad();

    expect(onChange).toHaveBeenCalledWith('');
  });
});

async function waitForSelectionLoad() {
  await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/discogs?folders=true&refresh=true'));
}
