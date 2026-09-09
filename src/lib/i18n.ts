export const locales = ['ja', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ja';

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Path to the home page in the given locale. Single-page site, so home is all we need. */
export function localizedPath(locale: Locale): string {
  return locale === defaultLocale ? '/' : `/${locale}/`;
}

/** The other locale, for the language switcher. */
export function alternateLocale(locale: Locale): Locale {
  return locale === 'ja' ? 'en' : 'ja';
}
