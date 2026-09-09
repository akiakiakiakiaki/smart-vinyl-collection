import { describe, expect, it } from 'vitest';
import { buildOAuthHeader } from '@/lib/discogs/oAuth';

describe('buildOAuthHeader', () => {
  it('creates an OAuth header with the required credentials', () => {
    const header = buildOAuthHeader({
      method: 'GET',
      url: 'https://api.discogs.com/oauth/identity',
      consumerKey: 'consumer-key',
      consumerSecret: 'consumer-secret',
      token: 'access-token',
      tokenSecret: 'access-secret',
    });

    expect(header).toMatch(/^OAuth /);
    expect(header).toContain('oauth_consumer_key="consumer-key"');
    expect(header).toContain('oauth_token="access-token"');
    expect(header).toContain('oauth_signature_method="HMAC-SHA1"');
    expect(header).toMatch(/oauth_nonce="[^"]+"/);
    expect(header).toMatch(/oauth_timestamp="\d+"/);
    expect(header).toMatch(/oauth_signature="[^"]+"/);
  });

  it('includes extra parameters in the generated header', () => {
    const header = buildOAuthHeader({
      method: 'POST',
      url: 'https://api.discogs.com/oauth/request_token',
      consumerKey: 'consumer-key',
      consumerSecret: 'consumer-secret',
      extraParams: { oauth_callback: 'http://localhost:3000/callback' },
    });

    expect(header).toContain('oauth_callback="http%3A%2F%2Flocalhost%3A3000%2Fcallback"');
  });
});
