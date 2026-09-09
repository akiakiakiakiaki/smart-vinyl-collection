'use client';

import { Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function LogoutButton() {
  const t = useTranslations('common');
  const router = useRouter();
  const clearUser = useUserStore((s) => s.clearUser);
  const handleLogout = async () => {
    clearUser();

    await fetch('/api/discogs/auth/logout');

    router.push('/logout');
  };

  return (
    <Button
      variant="contained"
      color="secondary"
      startIcon={<LogoutIcon />}
      onClick={handleLogout}
    >
      {t('logout')}
    </Button>
  );
}
