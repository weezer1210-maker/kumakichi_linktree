import { z } from 'zod';

const localized = z.object({ ja: z.string().min(1), en: z.string().min(1) });

export const iconNames = [
  'instagram', 'x', 'threads', 'note',
  'line-stickers', 'line-emoji', 'suzuri', 'mail',
] as const;
export type IconName = (typeof iconNames)[number];
const iconName = z.enum(iconNames);

const linkUrl = z
  .string()
  .refine((u) => u.startsWith('https://') || u.startsWith('mailto:'), {
    message: 'url must start with https:// or mailto:',
  });

export const linkItemSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'id must be kebab-case'),
  label: localized,
  url: linkUrl,
  icon: iconName,
  description: localized.optional(),
  enabled: z.boolean(),
  order: z.number().int(),
});
export type LinkItem = z.infer<typeof linkItemSchema>;

export const linksSchema = z.array(linkItemSchema).superRefine((items, ctx) => {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) {
      ctx.addIssue({ code: 'custom', message: `duplicate id: ${item.id}` });
    }
    seen.add(item.id);
  }
});

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD')
  .refine((s) => {
    const [y, m, d] = s.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
  }, 'date is not a real calendar date');

export const newsItemSchema = z.object({
  date: isoDate,
  title: localized,
  url: z.string().url().optional(),
});
export type NewsItem = z.infer<typeof newsItemSchema>;
export const newsSchema = z.array(newsItemSchema);

export const siteSchema = z.object({
  handle: z.string().min(1),
  email: z.string().email(),
  domain: z.string().min(1),
  copyrightName: localized,
  profile: localized,
  slideshow: z.object({
    intervalMs: z.number().int().positive(),
    fadeMs: z.number().int().positive(),
  }),
});
export type SiteMeta = z.infer<typeof siteSchema>;
