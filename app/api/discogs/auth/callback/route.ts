import { NextResponse } from 'next/server';
import { buildOAuthHeader } from '@/lib/discogsOauth';

export async function GET(request: Request) {
  const urlObj = new URL(request.url);

  const oauth_token = urlObj.searchParams.get('oauth_token')!;
  const oauth_verifier = urlObj.searchParams.get('oauth_verifier')!;

  const consumerKey = process.env.DISCOGS_CONSUMER_KEY!;
  const consumerSecret = process.env.DISCOGS_CONSUMER_SECRET!;

  const requestTokenSecret = request.headers.get('cookie')?.match(/discogs_request_secret=([^;]+)/)?.[1];

  const url = 'https://api.discogs.com/oauth/access_token';

  const header = buildOAuthHeader({
    method: 'POST',
    url,
    consumerKey,
    consumerSecret,
    token: oauth_token,
    tokenSecret: requestTokenSecret,
    extraParams: {
      oauth_verifier,
    },
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: header,
    },
  });

  const text = await res.text();
  const params = new URLSearchParams(text);

  const accessToken = params.get('oauth_token');
  const accessSecret = params.get('oauth_token_secret');

  if (!accessToken || !accessSecret) {
    return NextResponse.json({ error: 'Failed to get access token' }, { status: 500 });
  }

  const response = NextResponse.redirect('http://localhost:3000/');

  response.cookies.set('discogs_access_token', accessToken, { httpOnly: true });
  response.cookies.set('discogs_access_secret', accessSecret, { httpOnly: true });

  return response;
}
