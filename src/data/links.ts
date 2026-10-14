import { linksSchema, type LinkItem } from './schema';

const raw: LinkItem[] = [
  { id: 'instagram', label: { ja: 'Instagram', en: 'Instagram' },
    url: 'https://www.instagram.com/shiba_kuma777', icon: 'instagram', enabled: true, order: 1 },
  { id: 'x', label: { ja: 'X', en: 'X' },
    url: 'https://x.com/kumakichi_tech', icon: 'x', enabled: true, order: 2 },
  { id: 'threads', label: { ja: 'Threads', en: 'Threads' },
    url: 'https://www.threads.com/@shiba_kuma777', icon: 'threads', enabled: true, order: 3 },
  { id: 'youtube', label: { ja: 'YouTube', en: 'YouTube' },
    url: 'https://www.youtube.com/@shiba_kuma777', icon: 'youtube', enabled: true, order: 4 },
  { id: 'tiktok', label: { ja: 'TikTok', en: 'TikTok' },
    url: 'https://www.tiktok.com/@siba_kuma777?_r=1&_t=ZS-9AXdMHHakIa', icon: 'tiktok', enabled: true, order: 5 },
  { id: 'note', label: { ja: 'note', en: 'note' },
    url: 'https://note.com/kumakichi_tech', icon: 'note', enabled: true, order: 6 },
  { id: 'line-stickers', label: { ja: 'LINE スタンプ', en: 'LINE Stickers' },
    url: 'https://line.me/S/shop/sticker/author/6179403', icon: 'line-stickers', enabled: true, order: 7 },
  { id: 'line-emoji', label: { ja: 'LINE 絵文字', en: 'LINE Emoji' },
    url: 'https://line.me/S/shop/emoji/author/11986723', icon: 'line-emoji', enabled: true, order: 8 },
  { id: 'line-themes', label: { ja: 'LINE 着せ替え', en: 'LINE Themes' },
    url: 'https://store.line.me/themeshop/product/75941f08-ee8d-4bc6-b0b2-7b9e0109a565/ja', icon: 'line-themes', enabled: true, order: 9 },
  { id: 'suzuri', label: { ja: 'SUZURI（グッズ）', en: 'SUZURI (Goods)' },
    url: 'https://suzuri.jp/shiba_kuma777', icon: 'suzuri', enabled: true, order: 10 },
];

export const links: LinkItem[] = linksSchema
  .parse(raw)
  .slice()
  .sort((a, b) => a.order - b.order);

export const enabledLinks: LinkItem[] = links.filter((link) => link.enabled);
