'use client';
import { Button, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function Page() {
  const router = useRouter();
  const t = useTranslations('home');

  const handleVisitCollections = () => {
    router.push('/collection/overview');
  };
  return (
    <Stack sx={{ height: '100%' }}>
      <Stack sx={{ alignItems: 'center' }}>
        <Typography
          variant="h5"
          sx={{ pb: 1.5 }}
        >
          {t('welcome')}
        </Typography>
        <Typography sx={{ pb: 2.5 }}>{t('description')}</Typography>
      </Stack>
      <Stack sx={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Button
          color="primary"
          variant="contained"
          onClick={handleVisitCollections}
        >
          {t('exploreCollections')}
        </Button>
      </Stack>
    </Stack>
  );
}
