'use client';

import Box from '@mui/material/Box';
import { ReleaseToolbar } from '@/components/releases/ReleaseToolbar';

export default function CollectionReleaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ height: '100%', overflow: 'auto', px: { xs: 2, md: 4 }, py: 3 }}>
      <ReleaseToolbar />
      {children}
    </Box>
  );
}
