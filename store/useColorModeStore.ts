import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ColorModePreference = 'system' | 'light' | 'dark';

type ColorModeState = {
  mode: ColorModePreference;
  setMode: (mode: ColorModePreference) => void;
  resetMode: () => void;
};

export const useColorModeStore = create<ColorModeState>()(
  persist(
    (set) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
      resetMode: () => set({ mode: 'system' }),
    }),
    {
      name: 'color-mode-storage',
      partialize: (state) => ({ mode: state.mode }),
    }
  )
);
