import { http } from 'msw';

export const handlers = [
  http.get('https://api.discogs.com/*', () => new Response(null, { status: 501 })),
  http.get('https://example.com/api/msw-test', () => Response.json({ ok: true })),
];
