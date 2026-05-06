import Discogs from 'disconnect';

const DISCOGS_USER_AGENT = process.env.DISCOGS_USER_AGENT || 'smart-vinyl-collection/0.1.0';

export type DiscogsRateLimit = {
  limit: number;
  used: number;
  remaining: number;
};

export type DisconnectAuth = {
  consumerKey: string;
  consumerSecret: string;
  token: string;
  tokenSecret: string;
};

export type DisconnectDatabase = {
  getReleaseRating: (
    releaseId: number,
    username: string,
    callback: (err: Error | null, data: { rating?: number } | null, rateLimit?: DiscogsRateLimit | null) => void
  ) => void;
};

type DisconnectClientInstance = {
  database: () => DisconnectDatabase;
};

type DisconnectClientConstructor = new (
  userAgent: string,
  auth: {
    method: 'oauth';
    level: 2;
    consumerKey: string;
    consumerSecret: string;
    token: string;
    tokenSecret: string;
  }
) => DisconnectClientInstance;

const DiscogsClient = Discogs.Client as DisconnectClientConstructor;

export function createDisconnectDatabase(auth: DisconnectAuth) {
  const client = new DiscogsClient(DISCOGS_USER_AGENT, {
    method: 'oauth',
    level: 2,
    consumerKey: auth.consumerKey,
    consumerSecret: auth.consumerSecret,
    token: auth.token,
    tokenSecret: auth.tokenSecret,
  });

  return client.database();
}
