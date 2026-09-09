import { describe, expect, it } from 'vitest';
import { linkItemSchema, linksSchema, newsItemSchema, siteSchema } from './schema';

const goodLink = {
  id: 'instagram',
  label: { ja: 'Instagram', en: 'Instagram' },
  url: 'https://example.com/kumakichi',
  icon: 'instagram',
  enabled: true,
  order: 1,
};

describe('linkItemSchema', () => {
  it('accepts a well-formed https link', () => {
    expect(() => linkItemSchema.parse(goodLink)).not.toThrow();
  });
  it('accepts a mailto url', () => {
    expect(() => linkItemSchema.parse({ ...goodLink, id: 'mail', icon: 'mail', url: 'mailto:a@b.com' })).not.toThrow();
  });
  it('rejects a non-https, non-mailto url', () => {
    expect(() => linkItemSchema.parse({ ...goodLink, url: 'http://insecure.example' })).toThrow();
  });
  it('rejects an unknown icon', () => {
    expect(() => linkItemSchema.parse({ ...goodLink, icon: 'tiktok' })).toThrow();
  });
  it('rejects a missing en label', () => {
    expect(() => linkItemSchema.parse({ ...goodLink, label: { ja: 'あ' } })).toThrow();
  });
});

describe('linksSchema', () => {
  it('rejects duplicate ids', () => {
    expect(() => linksSchema.parse([goodLink, { ...goodLink }])).toThrow(/duplicate/i);
  });
});

describe('newsItemSchema', () => {
  it('accepts an ISO date', () => {
    expect(() => newsItemSchema.parse({ date: '2026-09-01', title: { ja: 'あ', en: 'a' } })).not.toThrow();
  });
  it('rejects a non-ISO date', () => {
    expect(() => newsItemSchema.parse({ date: '2026/09/01', title: { ja: 'あ', en: 'a' } })).toThrow();
  });
  it('rejects an impossible date', () => {
    expect(() => newsItemSchema.parse({ date: '2026-13-40', title: { ja: 'あ', en: 'a' } })).toThrow();
  });
});

describe('siteSchema', () => {
  it('rejects an invalid email', () => {
    expect(() =>
      siteSchema.parse({
        handle: 'kumakichi55',
        email: 'not-an-email',
        domain: 'kumakichi55.com',
        copyrightName: { ja: 'くまきち', en: 'Kumakichi' },
        profile: { ja: 'あ', en: 'a' },
        slideshow: { intervalMs: 5000, fadeMs: 900 },
      }),
    ).toThrow();
  });
});
