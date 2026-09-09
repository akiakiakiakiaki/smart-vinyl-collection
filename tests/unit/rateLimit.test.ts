import { afterEach, describe, expect, it, vi } from 'vitest';
import { shouldPauseForRateLimit, waitForRateLimitWindow } from '@/lib/discogs/rateLimit';

describe('rateLimit', () => {
  afterEach(() => vi.useRealTimers());

  it('pauses only when the remaining quota is at or below the safety buffer', () => {
    expect(shouldPauseForRateLimit(null)).toBe(false);
    expect(shouldPauseForRateLimit(3)).toBe(false);
    expect(shouldPauseForRateLimit(2)).toBe(true);
    expect(shouldPauseForRateLimit(0)).toBe(true);
  });

  it('does not wait when the signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    const timeoutSpy = vi.spyOn(globalThis, 'setTimeout');

    await waitForRateLimitWindow(controller.signal);

    expect(timeoutSpy).not.toHaveBeenCalled();
  });

  it('resolves after the configured rate-limit window', async () => {
    vi.useFakeTimers();

    const promise = waitForRateLimitWindow();
    await vi.advanceTimersByTimeAsync(15_000);

    await expect(promise).resolves.toBeUndefined();
  });

  it('resolves early when the signal aborts during the wait', async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const promise = waitForRateLimitWindow(controller.signal);

    controller.abort();

    await expect(promise).resolves.toBeUndefined();
    expect(vi.getTimerCount()).toBe(0);
  });
});
