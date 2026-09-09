import { describe, expect, it } from 'vitest';
import { alternateLocale, defaultLocale, isLocale, localizedPath, locales } from './i18n';

describe('i18n core', () => {
  it('exposes exactly ja and en, default ja', () => {
    expect([...locales]).toEqual(['ja', 'en']);
    expect(defaultLocale).toBe('ja');
  });

  it('isLocale narrows known values only', () => {
    expect(isLocale('ja')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale('')).toBe(false);
  });

  it('localizedPath returns "/" for ja and "/en/" for en', () => {
    expect(localizedPath('ja')).toBe('/');
    expect(localizedPath('en')).toBe('/en/');
  });

  it('alternateLocale flips ja<->en', () => {
    expect(alternateLocale('ja')).toBe('en');
    expect(alternateLocale('en')).toBe('ja');
  });
});
