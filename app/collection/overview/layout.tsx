'use client';

import { CollectionToolbar } from '@/components/collection/CollectionToolbar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

export default function CollectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <Stack sx={{ height: '100%', p: 2.5, minWidth: 0 }}>
      <CollectionToolbar />
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>{children}</Box>
    </Stack>
  );
}
