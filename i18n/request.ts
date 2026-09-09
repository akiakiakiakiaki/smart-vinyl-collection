import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { DEFAULT_LOCALE, resolveLocale } from './config';
import de from '../messages/de.json';
import en from '../messages/en.json';
import es from '../messages/es.json';

const messages = { en, de, es };

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const locale = resolveLocale({
    cookieLocale: cookieStore.get('NEXT_LOCALE')?.value,
    acceptLanguage: headerStore.get('accept-language'),
  });

  return {
    locale: locale || DEFAULT_LOCALE,
    messages: messages[locale],
  };
});
