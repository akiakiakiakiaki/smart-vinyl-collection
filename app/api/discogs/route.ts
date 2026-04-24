import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { getCollection, getFolders } from '@/lib/services/collectionService';
import { handleIdentityRequest } from '@/lib/services/identityService';
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folderName = searchParams.get('folder') || 'CR';
  const progress = searchParams.get('progress') === 'true';
  const refresh = searchParams.get('refresh') === 'true';
  const refreshRatings = searchParams.get('refreshRatings') === 'true';
  const isIdentityRequest = searchParams.get('identity') === 'true';
  const foldersOnly = searchParams.get('folders') === 'true';

  const auth = await getAuth();

  if (!auth) {
    if (isIdentityRequest) {
      return NextResponse.json({ username: null, name: null, avatar_url: null });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token, secret: tokenSecret, username: usernameFromCookie } = auth;

  const ctx = {
    consumerKey: process.env.DISCOGS_CONSUMER_KEY!,
    consumerSecret: process.env.DISCOGS_CONSUMER_SECRET!,
    token,
    tokenSecret,
  };

  if (isIdentityRequest) {
    return handleIdentityRequest(ctx, usernameFromCookie ?? null);
  }

  if (foldersOnly) {
    const folders = await getFolders(usernameFromCookie!, ctx);
    return NextResponse.json({ folders: folders.folders });
  }

  if (!usernameFromCookie) {
    return NextResponse.json(
      { error: 'Missing Discogs username in session. Please sign out and sign in again.' },
      { status: 401 }
    );
  }

  return await getCollection({
    username: usernameFromCookie,
    folderName,
    progress,
    refresh,
    refreshRatings,
    ctx,
    signal: request.signal,
  });
}
