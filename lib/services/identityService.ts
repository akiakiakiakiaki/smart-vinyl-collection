import { NextResponse } from 'next/server';
import { DiscogsUpstreamError } from '@/lib/discogs/errors';
import { getIdentity, getUserProfile, DiscogsContext } from '@/lib/discogs/client';

export async function handleIdentityRequest(ctx: DiscogsContext, usernameFromCookie: string | null) {
  try {
    const identity = await getIdentity(ctx);
    const username = usernameFromCookie ?? identity?.username;

    if (!username) {
      throw new DiscogsUpstreamError('Identity missing username', 502, identity);
    }

    const profile = await getUserProfile(username, ctx);

    const res = NextResponse.json({
      username,
      name: profile?.name ?? null,
      avatar_url: profile?.avatar_url ?? null,
    });

    if (!usernameFromCookie) {
      res.cookies.set('discogs_username', username, { httpOnly: true });
    }

    return res;
  } catch (err) {
    if (err instanceof DiscogsUpstreamError) {
      return NextResponse.json({ error: err.message, upstream: err.upstream ?? null }, { status: err.status });
    }
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to fetch identity' }, { status: 500 });
  }
}
