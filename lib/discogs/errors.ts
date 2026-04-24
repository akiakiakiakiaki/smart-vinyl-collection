export class DiscogsUpstreamError extends Error {
  status: number;
  upstream?: unknown;

  constructor(message: string, status: number, upstream?: unknown) {
    super(message);
    this.name = 'DiscogsUpstreamError';
    this.status = status;
    this.upstream = upstream;
  }
}
