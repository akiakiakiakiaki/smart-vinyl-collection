'use client';

import { useEffect } from 'react';
import { loadUser } from './lib/loadUser';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import UserInfo from '@/components/UserInfo';
import LogoutButton from '@/components/LogoutButton';
import { useUserStore } from '@/app/store/useUserStore';

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    loadUser();
  }, []);

  const user = useUserStore((s) => s.user);

  return (
    <ThemeProvider theme={theme}>
      <div className="flex flex-col h-screen">
        <header className="flex justify-between p-4 items-center">
          {user && user.username && (
            <>
              <UserInfo />
              <LogoutButton />
            </>
          )}
        </header>
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </ThemeProvider>
  );
}
