'use client';
import { Box, Typography } from '@mui/material';
import LoginButton from '@/components/LoginButton';
import { useTranslations } from 'next-intl';
export default function LoginPage() {
  const t = useTranslations('auth');
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography
        component="h1"
        variant="h4"
        sx={{ mb: 2 }}
      >
        {t('loginTitle')}
      </Typography>
      <LoginButton />
    </Box>
  );
}
