import { describe, expect, it } from 'vitest';
import { formatDiscogsDate, formatEta, formatPrice } from '@/lib/formatUtils';

describe('formatUtils', () => {
  it('formats a Discogs date for the en-US locale', () => {
    expect(formatDiscogsDate('2026-01-02T12:00:00Z', 'en-US')).toBe('Jan 2, 2026');
  });

  it('formats a Discogs date for the de-DE locale', () => {
    expect(formatDiscogsDate('2026-01-02T12:00:00Z', 'de-DE')).toBe('2. Jan. 2026');
  });

  it('formats a Discogs date for the es-ES locale', () => {
    expect(formatDiscogsDate('2026-01-02T12:00:00Z', 'es-ES')).toBe('2 ene 2026');
  });

  it('returns the original value for an invalid date', () => {
    expect(formatDiscogsDate('not-a-date')).toBe('not-a-date');
  });

  it('formats durations with and without hours', () => {
    expect(formatEta(65)).toBe('01:05');
    expect(formatEta(3661)).toBe('1:01:01');
  });

  it('formats nullable prices', () => {
    expect(formatPrice(12.5)).toBe('$12.50');
    expect(formatPrice(null)).toBeNull();
  });

  it('formats prices for the es-ES locale', () => {
    expect(formatPrice(12.5, 'es-ES')).toBe('12,50 US$');
  });
});
