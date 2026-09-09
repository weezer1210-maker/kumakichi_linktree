import type { NewsItem } from '../data/schema';

/** Most-recent-first, capped at `limit`. Pure: input is not mutated. */
export function selectNews(items: readonly NewsItem[], limit: number): NewsItem[] {
  return [...items]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, limit);
}
