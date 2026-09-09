import type { Locale } from '../lib/i18n';
import ja, { type Dict } from './ja';
import en from './en';

const dictionaries: Record<Locale, Dict> = { ja, en };

export function t(locale: Locale): Dict {
  return dictionaries[locale];
}

export type { Dict };
