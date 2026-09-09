'use client';
import { Box, Button, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function Page() {
  const router = useRouter();
  const t = useTranslations('home');

  const handleVisitCollections = () => {
    router.push('/collection/overview');
  };
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col items-center">
        <Typography
          variant="h5"
          className="pb-3"
        >
          {t('welcome')}
        </Typography>
        <Typography className="pb-5">{t('description')}</Typography>
      </div>
      <div className="flex flex-col items-center grow justify-center">
        <Button
          color="primary"
          variant="contained"
          onClick={handleVisitCollections}
        >
          {t('exploreCollections')}
        </Button>
      </div>
    </div>
  );
}
