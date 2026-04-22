'use client';

import { Button } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import { useUserStore } from '@/app/store/useUserStore';

export default function LoginButton() {
  const handleLogin = async () => {
    window.location.href = '/api/discogs/auth/start';
  };

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<LoginIcon />}
      onClick={handleLogin}
    >
      Login with Discogs
    </Button>
  );
}
