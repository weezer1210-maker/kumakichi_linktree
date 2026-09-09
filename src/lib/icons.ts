import type { IconName } from '../data/schema';

const S = 'width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';

const icons: Record<IconName | 'chevron', string> = {
  instagram: `<svg ${S}><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4.4"></circle><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"></circle></svg>`,
  x: `<svg ${S}><path d="M5 5l14 14M19 5L5 19"></path></svg>`,
  threads: `<svg ${S}><circle cx="12" cy="12" r="4"></circle><path d="M16 12v1.6a3 3 0 0 0 5.6 1.4A9 9 0 1 0 18 19.2"></path></svg>`,
  note: `<svg ${S}><circle cx="12" cy="12" r="9"></circle><path d="M9 16.5v-7l6 7v-7"></path></svg>`,
  'line-stickers': `<svg ${S}><path d="M21 11.2c0 3.7-4 6.7-9 6.7-1 0-2-.12-2.9-.35L4 19l1.3-3.4C4.5 14.5 4 12.9 4 11.2 4 7.5 8 4.5 12.5 4.5S21 7.5 21 11.2Z"></path><path d="M12.5 8.7l1 2 2.1.3-1.6 1.5.4 2.1-1.9-1-1.9 1 .4-2.1-1.6-1.5 2.1-.3Z" stroke-width="1.1"></path></svg>`,
  'line-emoji': `<svg ${S}><path d="M21 11.2c0 3.7-4 6.7-9 6.7-1 0-2-.12-2.9-.35L4 19l1.3-3.4C4.5 14.5 4 12.9 4 11.2 4 7.5 8 4.5 12.5 4.5S21 7.5 21 11.2Z"></path><circle cx="10" cy="11" r=".9" fill="currentColor" stroke="none"></circle><circle cx="15" cy="11" r=".9" fill="currentColor" stroke="none"></circle><path d="M10 13.5c.7.7 3.3.7 4 0" stroke-width="1.1"></path></svg>`,
  suzuri: `<svg ${S}><path d="M9 4 6 5.5 3 9l3 2v9h12v-9l3-2-3-3.5L15 4c-.6 1.8-5.4 1.8-6 0Z"></path></svg>`,
  mail: `<svg ${S}><rect x="3" y="5" width="18" height="14" rx="2.5"></rect><path d="M4 7.5l8 5.5 8-5.5"></path></svg>`,
  chevron: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"></path></svg>`,
};

export function icon(name: IconName | 'chevron'): string {
  return icons[name];
}
