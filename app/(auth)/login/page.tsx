'use client';
import { Box, Typography } from '@mui/material';
import LoginButton from '@/components/LoginButton';
export default function LoginPage() {
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
        Login with Discogs
      </Typography>
      <LoginButton />
    </Box>
  );
}
