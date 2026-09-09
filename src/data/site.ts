import type { ImageMetadata } from 'astro';
import { siteSchema, type SiteMeta } from './schema';

import hero1 from '../assets/hero/hero-1.jpg';
import hero2 from '../assets/hero/hero-2.jpg';
import hero3 from '../assets/hero/hero-3.jpg';

export const site: SiteMeta = siteSchema.parse({
  handle: 'kumakichi55',
  email: 'CHANGE-ME@example.com',
  domain: 'kumakichi55.com',
  copyrightName: { ja: 'くまきち', en: 'Kumakichi' },
  profile: {
    ja: '［プロフィール文をここに］',
    en: '[Profile text goes here]',
  },
  slideshow: { intervalMs: 5000, fadeMs: 900 },
});

export interface HeroImage {
  src: ImageMetadata;
  alt: { ja: string; en: string };
}

export const heroImages: HeroImage[] = [
  { src: hero1, alt: { ja: '［写真1の説明］', en: '[Photo 1 description]' } },
  { src: hero2, alt: { ja: '［写真2の説明］', en: '[Photo 2 description]' } },
  { src: hero3, alt: { ja: '［写真3の説明］', en: '[Photo 3 description]' } },
];

if (heroImages.length < 1) {
  throw new Error('site: heroImages must have at least one entry');
}
