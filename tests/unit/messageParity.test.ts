import { describe, expect, it } from 'vitest';
import en from '../../messages/en.json';
import de from '../../messages/de.json';
import es from '../../messages/es.json';

function getMessageKeys(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object') return prefix ? [prefix] : [];

  return Object.entries(value).flatMap(([key, child]) =>
    getMessageKeys(child, prefix ? `${prefix}.${key}` : key)
  );
}

describe('translation messages', () => {
  it('contains the same message keys for every supported locale', () => {
    const englishKeys = getMessageKeys(en).sort();

    expect(getMessageKeys(de).sort()).toEqual(englishKeys);
    expect(getMessageKeys(es).sort()).toEqual(englishKeys);
  });
});
