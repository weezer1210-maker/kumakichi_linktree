import { linksSchema, type LinkItem } from './schema';
import { site } from './site';

const raw: LinkItem[] = [
  { id: 'instagram', label: { ja: 'Instagram', en: 'Instagram' },
    url: 'https://www.instagram.com/kumakichi55/', icon: 'instagram', enabled: true, order: 1 },
  { id: 'x', label: { ja: 'X', en: 'X' },
    url: 'https://x.com/kumakichi55', icon: 'x', enabled: true, order: 2 },
  { id: 'threads', label: { ja: 'Threads', en: 'Threads' },
    url: 'https://www.threads.net/@kumakichi55', icon: 'threads', enabled: true, order: 3 },
  { id: 'note', label: { ja: 'note', en: 'note' },
    url: 'https://note.com/CHANGE-ME', icon: 'note', enabled: true, order: 4 },
  { id: 'line-stickers', label: { ja: 'LINE スタンプ', en: 'LINE Stickers' },
    url: 'https://store.line.me/stickershop/author/CHANGE-ME', icon: 'line-stickers', enabled: true, order: 5 },
  { id: 'line-emoji', label: { ja: 'LINE 絵文字', en: 'LINE Emoji' },
    url: 'https://store.line.me/emojishop/author/CHANGE-ME', icon: 'line-emoji', enabled: true, order: 6 },
  { id: 'suzuri', label: { ja: 'SUZURI（グッズ）', en: 'SUZURI (Goods)' },
    url: 'https://suzuri.jp/CHANGE-ME', icon: 'suzuri', enabled: true, order: 7 },
  { id: 'mail', label: { ja: 'メールで問い合わせ', en: 'Email' },
    url: `mailto:${site.email}`, icon: 'mail', enabled: true, order: 8 },
];

export const links: LinkItem[] = linksSchema
  .parse(raw)
  .slice()
  .sort((a, b) => a.order - b.order);

export const enabledLinks: LinkItem[] = links.filter((link) => link.enabled);
