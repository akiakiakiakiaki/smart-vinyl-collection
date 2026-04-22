'use client';

import { Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useUserStore } from '@/app/store/useUserStore';

export default function LogoutButton() {
  const clearUser = useUserStore((s) => s.clearUser);
  const handleLogout = async () => {
    clearUser();

    await fetch('/api/discogs/auth/logout');

    window.location.href = '/logout';
  };

  return (
    <Button
      variant="contained"
      color="secondary"
      startIcon={<LogoutIcon />}
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
}
