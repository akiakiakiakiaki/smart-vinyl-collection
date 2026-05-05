import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { getReleaseDetail } from '@/lib/services/releaseService';

export async function GET(request: Request, { params }: { params: Promise<{ releaseId: string }> }) {
  const auth = await getAuth();

  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { releaseId } = await params;
  const { searchParams } = new URL(request.url);
  const refresh = searchParams.get('refresh') === 'true';

  return getReleaseDetail({
    releaseId,
    username: auth.username,
    refresh,
    ctx: {
      consumerKey: process.env.DISCOGS_CONSUMER_KEY!,
      consumerSecret: process.env.DISCOGS_CONSUMER_SECRET!,
      token: auth.token,
      tokenSecret: auth.secret,
    },
    signal: request.signal,
  });
}
