'use client';

import { Box, Button, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/login');
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
        >
          You are logged out
        </Typography>
        <Button
          variant="contained"
          onClick={handleBack}
        >
          Go back to App
        </Button>
      </Box>
    </Box>
  );
}
