'use client';

import { useEffect } from 'react';
import { Avatar, Box, Typography } from '@mui/material';
import { useUserStore } from '@/store/useUserStore';

export default function UserInfo() {
  const user = useUserStore((s) => s.user);

  if (!user) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Avatar src={user.avatar_url} />
      {user.name ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <Typography>
            <strong>{user.name}</strong>
          </Typography>
          <Typography variant="caption">({user.username})</Typography>
        </Box>
      ) : (
        <Typography>{user.username}</Typography>
      )}
    </Box>
  );
}
