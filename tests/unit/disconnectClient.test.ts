import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDisconnectDatabase } from '@/lib/discogs/disconnectClient';

const { ClientMock } = vi.hoisted(() => ({ ClientMock: vi.fn() }));

vi.mock('disconnect', () => ({
  default: { Client: ClientMock },
}));

describe('createDisconnectDatabase', () => {
  beforeEach(() => {
    ClientMock.mockReset();
    ClientMock.mockImplementation(function MockClient() {
      return { database: () => ({ getReleaseRating: vi.fn() }) };
    });
  });

  it('creates a level-two OAuth client and returns its database', () => {
    const database = createDisconnectDatabase({
      consumerKey: 'key',
      consumerSecret: 'secret',
      token: 'token',
      tokenSecret: 'token-secret',
    });

    expect(database).toHaveProperty('getReleaseRating');
    expect(ClientMock).toHaveBeenCalledWith('smart-vinyl-collection/0.1.0', {
      method: 'oauth',
      level: 2,
      consumerKey: 'key',
      consumerSecret: 'secret',
      token: 'token',
      tokenSecret: 'token-secret',
    });
  });
});
