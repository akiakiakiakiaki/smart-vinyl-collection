export const SUPPORTED_LOCALES = ['en', 'de', 'es'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: string | undefined | null): value is Locale {
  return value != null && SUPPORTED_LOCALES.includes(value as Locale);
}

type LocaleSources = {
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
};

export function resolveLocale({ cookieLocale, acceptLanguage }: LocaleSources): Locale {
  if (isLocale(cookieLocale)) return cookieLocale;

  for (const candidate of parseAcceptLanguage(acceptLanguage)) {
    if (isLocale(candidate)) return candidate;

    const language = candidate.split('-')[0];
    if (isLocale(language)) return language;
  }

  return DEFAULT_LOCALE;
}

function parseAcceptLanguage(header: string | null | undefined): string[] {
  if (!header) return [];

  return header
    .split(',')
    .map((entry, index) => {
      const [rawLocale, ...parameters] = entry.trim().split(';');
      const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith('q='));
      const quality = qualityParameter ? Number(qualityParameter.trim().slice(2)) : 1;

      return {
        locale: rawLocale.toLowerCase(),
        quality: Number.isNaN(quality) ? 0 : quality,
        index,
      };
    })
    .filter(({ locale, quality }) => locale !== '*' && quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index)
    .map(({ locale }) => locale);
}
