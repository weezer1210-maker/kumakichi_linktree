import { newsSchema, type NewsItem } from './schema';

const raw: NewsItem[] = [
  // 例:
  // { date: '2026-09-01', title: { ja: '新しいLINEスタンプを発売しました', en: 'New LINE stickers are out' },
  //   url: 'https://store.line.me/stickershop/author/CHANGE-ME' },
];

export const news: NewsItem[] = newsSchema.parse(raw);
