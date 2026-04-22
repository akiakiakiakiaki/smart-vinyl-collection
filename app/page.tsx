'use client';
import { Box, Button, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  const handleVisitCollections = () => {
    router.push('/collection-overview');
  };
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col items-center">
        <Typography
          variant="h5"
          className="pb-3"
        >
          Welcome
        </Typography>
        <Typography className="pb-5">This will be a fancy dashboard or something later</Typography>
      </div>
      <div className="flex flex-col items-center grow justify-center">
        <Button
          color="primary"
          variant="contained"
          onClick={handleVisitCollections}
        >
          Explore your Collections
        </Button>
      </div>
    </div>
  );
}
