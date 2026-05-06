export const RATE_LIMIT_PER_MINUTE = 60;
export const RATE_LIMIT_SAFETY_BUFFER = 2;
export const RATE_LIMIT_WINDOW_MS = 15_000;

export function shouldPauseForRateLimit(remaining: number | null) {
  return remaining !== null && remaining <= RATE_LIMIT_SAFETY_BUFFER;
}

export async function waitForRateLimitWindow(signal?: AbortSignal) {
  if (signal?.aborted) {
    return;
  }

  await new Promise<void>((resolve) => {
    const timeoutId = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, RATE_LIMIT_WINDOW_MS);

    const onAbort = () => {
      clearTimeout(timeoutId);
      signal?.removeEventListener('abort', onAbort);
      resolve();
    };

    signal?.addEventListener('abort', onAbort);
  });
}
