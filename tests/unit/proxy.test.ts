import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '@/proxy';

function request(pathname: string, cookie?: string) {
  return new NextRequest(`http://localhost:3000${pathname}`, {
    headers: cookie ? { cookie } : undefined,
  });
}

describe('proxy', () => {
  it('allows the public home route without a token', () => {
    expect(proxy(request('/')).status).toBe(200);
  });

  it('allows auth routes without a token', () => {
    expect(proxy(request('/api/discogs/auth/start')).status).toBe(200);
  });

  it('redirects protected routes without a token', () => {
    const response = proxy(request('/collection/overview'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/login');
  });

  it('allows protected routes with a token', () => {
    expect(proxy(request('/api/discogs', 'discogs_access_token=token')).status).toBe(200);
  });
});
