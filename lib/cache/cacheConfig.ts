const DEFAULT_CACHE_TTL_MS = 15 * 60 * 1000;

function getCacheTtlMs() {
  const configuredTtl = Number(process.env.CACHE_TTL_MS);

  return Number.isFinite(configuredTtl) && configuredTtl > 0
    ? configuredTtl
    : DEFAULT_CACHE_TTL_MS;
}

export const CACHE_TTL_MS = getCacheTtlMs();
