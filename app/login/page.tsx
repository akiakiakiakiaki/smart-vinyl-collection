'use client';
import { Box } from '@mui/material';
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
      <LoginButton></LoginButton>
    </Box>
  );
}
