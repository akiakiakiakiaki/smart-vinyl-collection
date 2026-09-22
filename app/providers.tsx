'use client';

import { useEffect } from 'react';
import { loadUser } from '@/lib/loadUser';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
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
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Stack component="header" direction="row" spacing={2} sx={{ p: 2, justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {user && user.username && <UserInfo />}
          </Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <ColorModeSwitch />
            {user && user.username && <LogoutButton />}
          </Stack>
        </Stack>
        <Box component="main" sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>{children}</Box>
      </Box>
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
