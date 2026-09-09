import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './mocks/server';
import en from '../messages/en.json';

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: (namespace: string) => (key: string, values?: Record<string, string | number>) => {
    const message = getMessage(en, `${namespace}.${key}`);
    return values ? message.replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? `{${name}}`)) : message;
  },
}));

function getMessage(messages: typeof en, path: string): string {
  const value = path.split('.').reduce<unknown>((current, segment) => {
    if (!current || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[segment];
  }, messages);

  if (typeof value !== 'string') throw new Error(`Missing test translation: ${path}`);
  return value;
}

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
