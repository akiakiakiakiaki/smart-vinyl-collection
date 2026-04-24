import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL('/logout', request.url));

  response.cookies.set('discogs_access_token', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  response.cookies.set('discogs_access_secret', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  response.cookies.set('discogs_username', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  response.cookies.set('discogs_request_secret', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  return response;
}
