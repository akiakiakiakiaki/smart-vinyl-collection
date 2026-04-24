import { buildOAuthHeader } from '@/lib/discogs/oAuth';
import { DiscogsUpstreamError } from './errors';

export type DiscogsContext = {
  consumerKey: string;
  consumerSecret: string;
  token: string;
  tokenSecret: string;
};

function buildDiscogsUrl(path: string, params?: Record<string, string | number>) {
  const baseUrl = process.env.DISCOGS_API_URL;
  if (!baseUrl) {
    throw new Error('Missing DISCOGS_API_URL in .env.local');
  }
  const url = new URL(path, baseUrl);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }
  return url.toString();
}

async function parseUpstreamError(res: Response) {
  try {
    return await res.json();
  } catch {
    try {
      const t = await res.text();
      return t || null;
    } catch {
      return null;
    }
  }
}

async function authedGet(url: string, ctx: DiscogsContext, signal?: AbortSignal) {
  const res = await fetch(url, {
    signal,
    headers: {
      Authorization: buildOAuthHeader({
        method: 'GET',
        url,
        consumerKey: ctx.consumerKey,
        consumerSecret: ctx.consumerSecret,
        token: ctx.token,
        tokenSecret: ctx.tokenSecret,
      }),
    },
  });

  if (!res.ok) {
    const upstream = await parseUpstreamError(res);
    throw new DiscogsUpstreamError(`Request failed: ${res.status}`, res.status, upstream);
  }

  return res.json();
}

export async function getIdentity(ctx: DiscogsContext) {
  const url = buildDiscogsUrl('oauth/identity');
  return authedGet(url, ctx);
}

export async function getUserProfile(username: string, ctx: DiscogsContext) {
  const url = buildDiscogsUrl(`users/${username}`);
  return authedGet(url, ctx);
}

export async function getFolders(username: string, ctx: DiscogsContext) {
  const url = buildDiscogsUrl(`users/${username}/collection/folders`);
  return authedGet(url, ctx);
}

export async function getFolderReleasesPage(
  username: string,
  folderId: number,
  page: number,
  ctx: DiscogsContext,
  perPage = 100,
  signal?: AbortSignal
) {
  const url = buildDiscogsUrl(`users/${username}/collection/folders/${folderId}/releases`, {
    per_page: perPage,
    page,
  });
  return authedGet(url, ctx, signal);
}
