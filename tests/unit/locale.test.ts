import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, resolveLocale } from '@/i18n/config';

describe('resolveLocale', () => {
  it('prefers a valid locale cookie over the browser language', () => {
    expect(resolveLocale({ cookieLocale: 'de', acceptLanguage: 'en-US,en;q=0.9' })).toBe('de');
  });

  it('matches regional browser languages to supported languages', () => {
    expect(resolveLocale({ acceptLanguage: 'de-DE,de;q=0.9,en;q=0.8' })).toBe('de');
    expect(resolveLocale({ acceptLanguage: 'en-US,en;q=0.9' })).toBe('en');
    expect(resolveLocale({ acceptLanguage: 'es-MX,es;q=0.9,en;q=0.8' })).toBe('es');
  });

  it('uses English when no supported language is available', () => {
    expect(resolveLocale({ cookieLocale: 'fr', acceptLanguage: 'fr-FR,pt;q=0.8' })).toBe(DEFAULT_LOCALE);
  });

  it('falls back to English for an empty browser header', () => {
    expect(resolveLocale({ acceptLanguage: '' })).toBe(DEFAULT_LOCALE);
  });

  it('honors quality values and ignores wildcard languages', () => {
    expect(resolveLocale({ acceptLanguage: 'fr;q=1,de;q=0.5,*;q=0.1' })).toBe('de');
    expect(resolveLocale({ acceptLanguage: '*;q=1' })).toBe(DEFAULT_LOCALE);
  });

  it('ignores malformed quality values', () => {
    expect(resolveLocale({ acceptLanguage: 'fr;q=abc,de;q=0.5' })).toBe('de');
  });

  it('keeps the original order for equally preferred languages', () => {
    expect(resolveLocale({ acceptLanguage: 'es;q=0.8,de;q=0.8' })).toBe('es');
  });
});
