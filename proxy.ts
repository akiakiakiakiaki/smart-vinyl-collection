import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// middleware with login token guard, route protection and conditional redirect if logged out
export function proxy(request: NextRequest) {
  const token = request.cookies.get('discogs_access_token');

  const { pathname } = request.nextUrl;

  const isPublicRoute = pathname === '/' || pathname.startsWith('/api/discogs/auth');

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/collection-overview/:path*', '/'],
};
