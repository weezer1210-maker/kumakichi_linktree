import { describe, expect, it } from 'vitest';
import type { NewsItem } from '../data/schema';
import { selectNews } from './news';

const item = (date: string): NewsItem => ({ date, title: { ja: date, en: date } });

describe('selectNews', () => {
  it('sorts by date descending', () => {
    const input = [item('2026-01-01'), item('2026-09-01'), item('2026-05-01')];
    expect(selectNews(input, 10).map((n) => n.date)).toEqual(['2026-09-01', '2026-05-01', '2026-01-01']);
  });

  it('limits to the requested count', () => {
    const input = [item('2026-01-01'), item('2026-09-01'), item('2026-05-01')];
    expect(selectNews(input, 2).map((n) => n.date)).toEqual(['2026-09-01', '2026-05-01']);
  });

  it('does not mutate the input array', () => {
    const input = [item('2026-01-01'), item('2026-09-01')];
    const copy = [...input];
    selectNews(input, 1);
    expect(input).toEqual(copy);
  });

  it('returns [] for an empty list', () => {
    expect(selectNews([], 3)).toEqual([]);
  });
});
