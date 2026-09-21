import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ColorModeSwitch from '@/components/ColorModeSwitch';
import { useColorModeStore } from '@/store/useColorModeStore';

const setModeMock = vi.fn();

vi.mock('@mui/material/styles', async () => {
  const actual = await vi.importActual<typeof import('@mui/material/styles')>('@mui/material/styles');

  return {
    ...actual,
    useColorScheme: () => ({ mode: 'dark', systemMode: 'dark', setMode: setModeMock }),
  };
});

afterEach(() => {
  setModeMock.mockReset();
  useColorModeStore.setState({ mode: 'system' });
});

describe('ColorModeSwitch', () => {
  it('switches from dark mode to light mode and updates the store', async () => {
    render(<ColorModeSwitch />);

    const switchButton = screen.getByRole('button', { name: 'Switch to light mode' });
    await userEvent.click(switchButton);

    expect(setModeMock).toHaveBeenCalledWith('light');
    expect(useColorModeStore.getState().mode).toBe('light');
  });
});
