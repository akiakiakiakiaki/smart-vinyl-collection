import { cookies } from 'next/headers';

export type AuthContext = {
  token: string;
  secret: string;
  username: string | null;
};

export async function getAuth(): Promise<AuthContext | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get('discogs_access_token')?.value ?? null;
  const secret = cookieStore.get('discogs_access_secret')?.value ?? null;
  const username = cookieStore.get('discogs_username')?.value ?? null;

  if (!token || !secret) return null;

  return { token, secret, username };
}

export async function requireAuth(): Promise<AuthContext> {
  const auth = await getAuth();

  if (!auth) {
    throw new Error('UNAUTHORIZED');
  }

  return auth;
}
