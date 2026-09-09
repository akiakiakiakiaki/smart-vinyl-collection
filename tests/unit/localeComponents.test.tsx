import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import LoginButton from '@/components/LoginButton';
import de from '../../messages/de.json';
import es from '../../messages/es.json';

vi.unmock('next-intl');

describe('localized components', () => {
  it.each([
    ['de', de, 'Mit Discogs anmelden'],
    ['es', es, 'Iniciar sesión con Discogs'],
  ] as const)('renders the LoginButton in %s', (locale, messages, label) => {
    render(
      <NextIntlClientProvider locale={locale} messages={messages}>
        <LoginButton />
      </NextIntlClientProvider>
    );

    expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
  });
});
