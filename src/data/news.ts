import { newsSchema, type NewsItem } from './schema';

const raw: NewsItem[] = [
  {
    date: '2026-09-16',
    title: { ja: 'クマキチのリンク集を開設しました', en: 'Kumakichi’s link page is now open' },
  },
];

export const news: NewsItem[] = newsSchema.parse(raw);
