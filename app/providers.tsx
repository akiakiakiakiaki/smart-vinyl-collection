'use client';

import { useEffect } from 'react';
import { loadUser } from '@/lib/loadUser';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import theme from './theme';
import UserInfo from '@/components/UserInfo';
import LogoutButton from '@/components/LogoutButton';
import ColorModeSwitch from '@/components/ColorModeSwitch';
import { useUserStore } from '@/store/useUserStore';
import { useColorModeStore } from '@/store/useColorModeStore';

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    loadUser();
  }, []);

  const user = useUserStore((s) => s.user);

  return (
    <ThemeProvider theme={theme} defaultMode="system">
      <ColorModeSync />
      <CssBaseline />
      <div className="flex flex-col h-screen">
        <header className="flex justify-between p-4 items-center">
          <div className="flex items-center gap-2">
            {user && user.username && <UserInfo />}
          </div>
          <div className="flex items-center gap-2">
            <ColorModeSwitch />
            {user && user.username && <LogoutButton />}
          </div>
        </header>
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </ThemeProvider>
  );
}

function ColorModeSync() {
  const { mode } = useColorScheme();
  const setModePreference = useColorModeStore((state) => state.setMode);

  useEffect(() => {
    if (mode !== undefined) {
      setModePreference(mode);
    }
  }, [mode, setModePreference]);

  return null;
}
