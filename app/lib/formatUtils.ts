const DEFAULT_LOCALE = 'en-US';

export function formatDiscogsDate(dateValue: string, locale = DEFAULT_LOCALE) {
  if (!dateValue) {
    return '';
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export { DEFAULT_LOCALE };
