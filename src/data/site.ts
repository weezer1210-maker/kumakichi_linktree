import type { ImageMetadata } from 'astro';
import { siteSchema, type SiteMeta } from './schema';

import hero1 from '../assets/hero/hero-1.jpg';
import hero2 from '../assets/hero/hero-2.jpg';
import hero3 from '../assets/hero/hero-3.jpg';

export const site: SiteMeta = siteSchema.parse({
  domain: 'kumakichi55.com',
  copyrightName: { ja: 'くまきち', en: 'Kumakichi' },
  profile: {
    ja: '17kgのタヌキ顔🐶柴犬クマキチ。\nイノシシ顔負けの穴掘り名人、散歩は断固拒否派。\nそんなクマキチのSNSと、毎日がちょっと楽しくなるかわいいLINEスタンプ・絵文字、SUZURIグッズをそろえました。気になるものは下のリンクからどうぞ。\nご連絡は各種SNSのDMよりお願いします。',
    en: 'Kumakichi is a 17 kg, tanuki-faced Shiba Inu 🐶\nA master digger who puts wild boars to shame—and a firm believer in refusing walks.\nFind Kumakichi\'s social media, plus cute LINE stickers, emoji, and SUZURI goods to brighten your day, in the links below.\nFor inquiries, please send a DM through any of Kumakichi\'s social media accounts.',
  },
  slideshow: { intervalMs: 5000, fadeMs: 900 },
});

export interface HeroImage {
  src: ImageMetadata;
  alt: { ja: string; en: string };
}

export const heroImages: HeroImage[] = [
  { src: hero2, alt: { ja: 'チェックのバンダナを着けたクマキチの顔', en: 'A close-up of Kumakichi wearing a checkered bandana' } },
  { src: hero1, alt: { ja: '椅子の下でくつろぎ、肉球を見せるクマキチ', en: 'Kumakichi relaxing under a chair with a paw on display' } },
  { src: hero3, alt: { ja: '前足を広げて抱えられるクマキチ', en: 'Kumakichi being held with his front paws outstretched' } },
];

if (heroImages.length < 1) {
  throw new Error('site: heroImages must have at least one entry');
}
