import { newsSchema, type NewsItem } from './schema';

const raw: NewsItem[] = [
  {
    date: '2026-10-18',
    title: { ja: 'クマキチの秋のLINEスタンプを公開しました', en: 'Kumakichi’s autumn LINE stickers are now available' },
    url: 'https://line.me/S/shop/sticker/author/6179403',
  },
  {
    date: '2026-10-14',
    title: { ja: 'YouTube と TikTok をはじめました', en: 'Kumakichi is now on YouTube and TikTok' },
  },
  {
    date: '2026-09-16',
    title: { ja: 'クマキチのリンク集を開設しました', en: 'Kumakichi’s link page is now open' },
  },
];

export const news: NewsItem[] = newsSchema.parse(raw);
