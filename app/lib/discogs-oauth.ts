import crypto from 'crypto';

function percentEncode(str: string) {
  return encodeURIComponent(str).replace(/[!*()']/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

function generateNonce(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function generateTimestamp() {
  return Math.floor(Date.now() / 1000).toString();
}

function buildBaseString(method: string, url: string, params: Record<string, string>) {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join('&');

  return [method.toUpperCase(), percentEncode(url), percentEncode(sorted)].join('&');
}

function sign(baseString: string, consumerSecret: string, tokenSecret = '') {
  const key = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;

  return crypto.createHmac('sha1', key).update(baseString).digest('base64');
}

export function buildOAuthHeader({
  method,
  url,
  consumerKey,
  consumerSecret,
  token = '',
  tokenSecret = '',
  extraParams = {},
}: {
  method: string;
  url: string;
  consumerKey: string;
  consumerSecret: string;
  token?: string;
  tokenSecret?: string;
  extraParams?: Record<string, string>;
}) {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: generateNonce(),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: generateTimestamp(),
    oauth_version: '1.0',
  };

  if (token) {
    oauthParams.oauth_token = token;
  }

  // IMPORTANT: extraParams must also be part of oauthParams (so they appear in header AND signature)
  Object.assign(oauthParams, extraParams);

  const allParams = {
    ...oauthParams,
  };

  const baseString = buildBaseString(method, url, allParams);

  const signature = sign(baseString, consumerSecret, tokenSecret);

  oauthParams.oauth_signature = signature;

  const header =
    'OAuth ' +
    Object.entries(oauthParams)
      .map(([key, value]) => `${percentEncode(key)}="${percentEncode(value)}"`)
      .join(', ');

  return header;
}
