import { NextResponse } from 'next/server';
import { buildOAuthHeader } from '@/app/lib/discogsOauth';

export async function GET() {
  const consumerKey = process.env.DISCOGS_CONSUMER_KEY!;
  const consumerSecret = process.env.DISCOGS_CONSUMER_SECRET!;
  if (!consumerKey || !consumerSecret) {
    return NextResponse.json(
      { error: 'Missing DISCOGS_CONSUMER_KEY or DISCOGS_CONSUMER_SECRET in .env.local' },
      { status: 500 }
    );
  }

  const url = 'https://api.discogs.com/oauth/request_token';

  const callbackUrl = 'http://localhost:3000/api/discogs/auth/callback';

  const header = buildOAuthHeader({
    method: 'POST',
    url,
    consumerKey,
    consumerSecret,
    extraParams: {
      oauth_callback: callbackUrl,
    },
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: header,
    },
  });

  const text = await res.text();
  console.log('Discogs response:', text);
  const params = new URLSearchParams(text);

  const requestToken = params.get('oauth_token');
  const requestSecret = params.get('oauth_token_secret');

  if (!requestToken || !requestSecret) {
    return NextResponse.json({ error: 'Failed to get request token' }, { status: 500 });
  }

  const response = NextResponse.redirect(`https://www.discogs.com/oauth/authorize?oauth_token=${requestToken}`);

  response.cookies.set('discogs_request_secret', requestSecret, {
    httpOnly: true,
  });

  return response;
}
