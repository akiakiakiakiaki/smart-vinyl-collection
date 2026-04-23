import { cookies } from 'next/headers';

export type AuthContext = {
  token: string;
  secret: string;
};

export async function getAuth(): Promise<AuthContext | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get('discogs_access_token')?.value ?? null;
  const secret = cookieStore.get('discogs_access_secret')?.value ?? null;

  if (!token || !secret) return null;

  return { token, secret };
}

export async function requireAuth(): Promise<AuthContext> {
  const auth = await getAuth();

  if (!auth) {
    throw new Error('UNAUTHORIZED');
  }

  return auth;
}
