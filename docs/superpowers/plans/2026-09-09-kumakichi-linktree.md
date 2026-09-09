# くまきち リンク集サイト Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 柴犬「くまきち」の全SNS・グッズ・LINEへの導線を1ページに集約した、独自ドメイン公開の Linktree 相当サイトを Astro + TypeScript で作る。

**Architecture:** Astro 5 の静的出力。日本語 `/` と英語 `/en/` の2ロケール（i18nルーティング、デフォルトはプレフィックスなし）。リンク・新着Info・プロフィール・写真は `src/data/*.ts` の型付きデータ＋Zodスキーマで管理し、ビルド時に検証。UIはほぼ静的HTML＋CSS（Tailwind v4 CSS-first）で、JavaScriptの島はヒーロー写真のクロスフェードとリンククリック計測のみ。GitHub Actions で `main` push → `astro build` → GitHub Pages 公開。

**Tech Stack:** Astro 5、TypeScript(strict)、Tailwind CSS v4（`@tailwindcss/vite`、`@theme`）、`@fontsource/zen-old-mincho`、Zod、Vitest（純関数のみ）、GoatCounter（解析）、GitHub Pages + `withastro/action`。

**Spec:** `docs/superpowers/specs/2026-09-09-kumakichi-linktree-design.md`

## Global Constraints

すべてのタスクの要件に、暗黙的に以下を含む。

- **Node**: ローカルは v24 系、CI は Node `20`（`withastro/action` の `node-version: 20`）で固定。
- **Astro 5**、**TypeScript `strict`**。`astro check` と `astro build` が常に成功すること。
- **Tailwind CSS v4 の CSS-first**。`tailwind.config.*` は作らない。デザイントークンは `src/styles/global.css` の `@theme` に定義。
- **静的出力のみ**。SSRアダプタは入れない。`astro.config.mjs` は `site: "https://kumakichi55.com"`、`base` は設定しない。
- **i18n**: `defaultLocale: "ja"`（プレフィックスなし）、`locales: ["ja", "en"]`、`routing.prefixDefaultLocale: false`。
- **実行時ネットワーク依存を作らない**。フォントは `@fontsource` で自己ホスト。Google Fonts の `<link>` は使わない。
- **解析は GoatCounter のみ**。環境変数 `PUBLIC_GOATCOUNTER_CODE` が未設定ならスニペットを一切出力しない。GA4 は使わない。
- **デザイントークン（既定値・verbatim）**: 背景 `#FAF9F6`、本文 `#1C1A17`、補助 `#6B6558`、罫線 `#E6E1D8`、アクセント `#B45309`。見出し書体は Zen Old Mincho、本文は `system-ui, -apple-system, "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif`。
- **多言語データ**: 外部に見えるラベル・alt・説明はすべて `{ ja: string; en: string }`。
- **プレースホルダー記法**: 文章は `［日本語］` / `[English]`、確定が要る固定値（URL・メール・解析コード等）は `CHANGE-ME` を含める。
- **アクセシビリティ**: `:focus-visible` にアクセント2pxのアウトライン、タップ領域44px以上、画像に `alt`、`<html lang>` と `hreflang` を出力、コントラストAA以上。
- **モーション**: `prefers-reduced-motion: reduce` を尊重。ヒーローの自動送りはタブ非表示中と手動操作後に停止。

---

## File Structure

新規プロジェクト。作成物の責務:

| ファイル | 責務 |
|---|---|
| `astro.config.mjs` | Astro設定（site, i18n, Tailwind vite plugin） |
| `tsconfig.json` | `astro/tsconfigs/strict` を継承 |
| `vitest.config.ts` | 純関数テストの設定（`src/**/*.test.ts`） |
| `package.json` | scripts（dev/build/preview/check/test）と依存 |
| `.github/workflows/deploy.yml` | Pagesへの自動デプロイ |
| `public/CNAME` | `kumakichi55.com` |
| `public/favicon.svg` | 柴犬モチーフの簡易favicon |
| `public/og.png` | OGP固定画像（当面プレースホルダー） |
| `src/styles/global.css` | Tailwind取り込み、`@theme`トークン、base reset、`@keyframes` |
| `src/lib/i18n.ts` | `Locale`型、`localizedPath`、`alternateLocale`（純関数） |
| `src/i18n/{ja,en}.ts`, `src/i18n/index.ts` | UI文言辞書と `t(locale)` |
| `src/data/schema.ts` | Zodスキーマと派生型（`LinkItem`/`NewsItem`/`IconName`…） |
| `src/lib/news.ts` | `selectNews(items, limit)`（降順ソート＋件数制限、純関数） |
| `src/data/site.ts` | サイト基本情報＋ヒーロー画像import |
| `src/data/links.ts` | リンク定義（検証済み・order昇順） |
| `src/data/news.ts` | 新着Info定義（検証済み） |
| `src/assets/hero/hero-{1,2,3}.jpg` | 仮ヒーロー写真 |
| `scripts/make-placeholders.mjs` | 仮写真を生成するスクリプト |
| `src/lib/icons.ts` | `IconName`＋`"chevron"` → インラインSVG文字列 |
| `src/lib/analytics.ts` | 型宣言（`window.goatcounter`）＋`trackClick`（クリック計測は `LinkList` の島でも委譲） |
| `src/layouts/Base.astro` | `<head>`（SEO/OGP/hreflang/canonical/favicon）、`<html lang>`、GoatCounterスニペット、global.css取り込み |
| `src/components/LangSwitch.astro` | `/` ⇄ `/en/` の相互リンク |
| `src/components/Footer.astro` | 著作権＋`mailto:` |
| `src/components/Hero.astro` | 写真スライド＋scrim＋名前＋言語トグル＋ドット＋制御スクリプト |
| `src/components/NewsList.astro` | 新着Info（`selectNews` で3件） |
| `src/components/LinkList.astro` | リンク一覧ラッパ＋クリック計測の委譲スクリプト |
| `src/components/LinkCard.astro` | 1リンク行（`<li><a data-link-id>…`） |
| `src/pages/index.astro` | 日本語ページ（`locale="ja"`） |
| `src/pages/en/index.astro` | 英語ページ（`locale="en"`） |
| `src/pages/404.astro` | 日英併記の簡易404 |
| `README.md` | データ編集・写真差し替え・デプロイ手順 |

---

## Task 1: プロジェクト雛形・設定・CI・初回ビルド

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `.nvmrc`, `.node-version`, `src/pages/index.astro`（暫定）, `public/CNAME`, `.github/workflows/deploy.yml`, `.env.example`

**Interfaces:**
- Consumes: なし
- Produces: 動作する Astro プロジェクト。`npm run build` が `dist/` を生成。`npm run check` が通る。

- [ ] **Step 1: Astro プロジェクトを最小テンプレートで作成**

作業ディレクトリ（このリポジトリのルート）で:

```bash
npm create astro@latest . -- --template minimal --install --no-git --typescript strict --skip-houston
```

既存の `docs/` や `.dc.html` 等が理由で中断される場合はプロンプトで「既存ファイルを残す」を選ぶ。作成後、生成された `src/pages/index.astro` は Step 6 で置き換える。

- [ ] **Step 2: 追加依存をインストール**

```bash
npm install zod @fontsource/zen-old-mincho
npm install -D @astrojs/check typescript vitest @tailwindcss/vite tailwindcss sharp
```

- [ ] **Step 3: `astro.config.mjs` を作成/置換**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://kumakichi55.com',
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 4: `tsconfig.json` を確認（strict 継承）**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 5: `package.json` の scripts を設定**

`scripts` を以下に置換（他はそのまま）:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 6: 暫定トップページを作成**

`src/pages/index.astro`:

```astro
---
---
<!doctype html>
<html lang="ja">
  <head><meta charset="utf-8" /><title>くまきち</title></head>
  <body><p>準備中</p></body>
</html>
```

- [ ] **Step 7: `vitest.config.ts` を作成**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 8: 固定ファイル群を作成**

`.nvmrc` と `.node-version`（同内容）:

```
20
```

`public/CNAME`:

```
kumakichi55.com
```

`.env.example`:

```
# GoatCounter のサイトコード（例: サイトが https://kumakichi.goatcounter.com なら "kumakichi"）。
# 未設定ならローカルでは解析スニペットを出力しない。
PUBLIC_GOATCOUNTER_CODE=
```

`.gitignore` に以下が含まれることを確認（`npm create astro` が大半を用意する。無ければ追記）:

```
node_modules/
dist/
.astro/
.env
.env.*
!.env.example
```

- [ ] **Step 9: GitHub Actions ワークフローを作成**

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Build with Astro
        uses: withastro/action@v3
        with:
          node-version: 20
        env:
          PUBLIC_GOATCOUNTER_CODE: ${{ vars.PUBLIC_GOATCOUNTER_CODE }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 10: ビルドと型チェックが通ることを確認**

```bash
npm run check
npm run build
```

Expected: どちらも成功。`dist/index.html` と `dist/CNAME` が生成される。

- [ ] **Step 11: Git リポジトリを初期化して初回コミット**

```bash
git init
git add -A
git commit -m "chore: scaffold Astro + TypeScript project with Pages CI"
```

---

## Task 2: グローバルスタイル・デザイントークン・フォント

**Files:**
- Create: `src/styles/global.css`
- Modify: `src/pages/index.astro`（一時的に global.css を読み込んで確認）

**Interfaces:**
- Consumes: Task 1 の Tailwind vite plugin
- Produces: `src/styles/global.css`。Tailwindユーティリティで `bg-bg` `text-ink` `text-muted` `border-hairline` `text-accent` `font-display` が使える。`.reveal-1/.reveal-2/.reveal-3` と `a[data-link-id]` に `fadeUp` アニメーション。

- [ ] **Step 1: `src/styles/global.css` を作成**

```css
@import "tailwindcss";

@theme {
  --color-bg: #FAF9F6;
  --color-ink: #1C1A17;
  --color-muted: #6B6558;
  --color-hairline: #E6E1D8;
  --color-accent: #B45309;

  --font-display: "Zen Old Mincho", "Yu Mincho", YuMincho, Georgia, serif;
  --font-sans: system-ui, -apple-system, "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif;
}

:root { color-scheme: light; }

* { box-sizing: border-box; }

html {
  background: var(--color-bg);
  color: var(--color-ink);
  font-family: var(--font-sans);
  -webkit-text-size-adjust: 100%;
}
body { margin: 0; }

a { color: inherit; text-decoration: none; }
img { display: block; max-width: 100%; height: auto; }

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 4px;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(9px); }
  to   { opacity: 1; transform: none; }
}

.reveal-1, .reveal-2, .reveal-3 {
  animation: fadeUp .55s cubic-bezier(.2, .7, .2, 1) both;
}
.reveal-2 { animation-delay: .12s; }
.reveal-3 { animation-delay: .18s; }

a[data-link-id] {
  animation: fadeUp .5s cubic-bezier(.2, .7, .2, 1) both;
}

@media (prefers-reduced-motion: reduce) {
  .reveal-1, .reveal-2, .reveal-3,
  a[data-link-id] { animation: none; }
  .hero-slide { transition: none !important; }
}
```

- [ ] **Step 2: 一時的にトップページで読み込んで確認**

`src/pages/index.astro` を一時的に:

```astro
---
import '@fontsource/zen-old-mincho/400.css';
import '@fontsource/zen-old-mincho/500.css';
import '../styles/global.css';
---
<!doctype html>
<html lang="ja">
  <head><meta charset="utf-8" /><title>くまきち</title></head>
  <body>
    <h1 class="font-display text-accent">くまきち</h1>
    <p class="text-muted">tokens ok</p>
  </body>
</html>
```

- [ ] **Step 3: ビルドで確認**

```bash
npm run build
```

Expected: 成功。生成CSSに `#b45309`（accent）と `Zen Old Mincho` の `@font-face` が含まれる。

```bash
grep -rl "b45309" dist/_astro/*.css
grep -rl "Zen Old Mincho" dist/_astro/*.css
```

- [ ] **Step 4: コミット**

```bash
git add src/styles/global.css src/pages/index.astro
git commit -m "feat: global styles, design tokens, self-hosted display font"
```

---

## Task 3: i18n コア（純関数・TDD）

**Files:**
- Create: `src/lib/i18n.ts`, `src/lib/i18n.test.ts`

**Interfaces:**
- Consumes: なし
- Produces:
  - `export const locales = ['ja', 'en'] as const`
  - `export type Locale = 'ja' | 'en'`
  - `export const defaultLocale: Locale`
  - `export function isLocale(value: string): value is Locale`
  - `export function localizedPath(locale: Locale): string` — ホームのパス（`ja` → `/`、`en` → `/en/`）
  - `export function alternateLocale(locale: Locale): Locale` — もう一方のロケール

- [ ] **Step 1: 失敗するテストを書く**

`src/lib/i18n.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { alternateLocale, defaultLocale, isLocale, localizedPath, locales } from './i18n';

describe('i18n core', () => {
  it('exposes exactly ja and en, default ja', () => {
    expect([...locales]).toEqual(['ja', 'en']);
    expect(defaultLocale).toBe('ja');
  });

  it('isLocale narrows known values only', () => {
    expect(isLocale('ja')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale('')).toBe(false);
  });

  it('localizedPath returns "/" for ja and "/en/" for en', () => {
    expect(localizedPath('ja')).toBe('/');
    expect(localizedPath('en')).toBe('/en/');
  });

  it('alternateLocale flips ja<->en', () => {
    expect(alternateLocale('ja')).toBe('en');
    expect(alternateLocale('en')).toBe('ja');
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npm test -- src/lib/i18n.test.ts`
Expected: FAIL（`Cannot find module './i18n'`）

- [ ] **Step 3: 最小実装を書く**

`src/lib/i18n.ts`:

```ts
export const locales = ['ja', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ja';

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Path to the home page in the given locale. Single-page site, so home is all we need. */
export function localizedPath(locale: Locale): string {
  return locale === defaultLocale ? '/' : `/${locale}/`;
}

/** The other locale, for the language switcher. */
export function alternateLocale(locale: Locale): Locale {
  return locale === 'ja' ? 'en' : 'ja';
}
```

- [ ] **Step 4: テストが通ることを確認**

Run: `npm test -- src/lib/i18n.test.ts`
Expected: PASS（4 tests）

- [ ] **Step 5: コミット**

```bash
git add src/lib/i18n.ts src/lib/i18n.test.ts
git commit -m "feat: i18n core helpers with tests"
```

---

## Task 4: UI文言辞書

**Files:**
- Create: `src/i18n/ja.ts`, `src/i18n/en.ts`, `src/i18n/index.ts`

**Interfaces:**
- Consumes: `Locale` from `src/lib/i18n.ts`
- Produces:
  - `export type Dict` — `ja` の形
  - `export function t(locale: Locale): Dict`
  - `Dict` の形: `{ nav: { toEnglish: string; toJapanese: string }, sections: { news: string; links: string }, a11y: { switchLanguage: string; photo: string }, hero: { kind: string }, meta: { title: string; description: string } }`

- [ ] **Step 1: `src/i18n/ja.ts` を作成**

```ts
const ja = {
  nav: { toEnglish: 'English', toJapanese: '日本語' },
  sections: { news: '新着', links: 'リンク' },
  a11y: { switchLanguage: '言語を切り替える', photo: '写真' },
  hero: { kind: '柴犬 / Shiba Inu' },
  meta: {
    title: 'くまきち｜柴犬くまきちのリンク集',
    description: '柴犬くまきちの Instagram・X・Threads・note、LINEスタンプ／絵文字、SUZURI へのリンク集。',
  },
} as const;

export default ja;
export type Dict = typeof ja;
```

- [ ] **Step 2: `src/i18n/en.ts` を作成（同じ形）**

```ts
import type { Dict } from './ja';

const en = {
  nav: { toEnglish: 'English', toJapanese: '日本語' },
  sections: { news: 'News', links: 'Links' },
  a11y: { switchLanguage: 'Switch language', photo: 'Photo' },
  hero: { kind: 'Shiba Inu' },
  meta: {
    title: 'Kumakichi | Links for Kumakichi the Shiba Inu',
    description: 'Links for Kumakichi the Shiba Inu: Instagram, X, Threads, note, LINE stickers & emoji, and SUZURI.',
  },
} satisfies Dict;

export default en;
```

- [ ] **Step 3: `src/i18n/index.ts` を作成**

```ts
import type { Locale } from '../lib/i18n';
import ja, { type Dict } from './ja';
import en from './en';

const dictionaries: Record<Locale, Dict> = { ja, en };

export function t(locale: Locale): Dict {
  return dictionaries[locale];
}

export type { Dict };
```

- [ ] **Step 4: 型チェック**

Run: `npm run check`
Expected: PASS（`en satisfies Dict` が形の不一致を検出しないこと）。

- [ ] **Step 5: コミット**

```bash
git add src/i18n
git commit -m "feat: bilingual UI string dictionaries"
```

---

## Task 5: データスキーマ（Zod・TDD）

**Files:**
- Create: `src/data/schema.ts`, `src/data/schema.test.ts`

**Interfaces:**
- Consumes: `zod`
- Produces:
  - `export const iconNames` — `readonly ['instagram','x','threads','note','line-stickers','line-emoji','suzuri','mail']`
  - `export type IconName`
  - `export const linkItemSchema`, `export type LinkItem = z.infer<typeof linkItemSchema>`
  - `export const linksSchema` — `LinkItem[]`、`id` 重複でエラー
  - `export const newsItemSchema`, `export type NewsItem`
  - `export const newsSchema` — `NewsItem[]`
  - `export const siteSchema`, `export type SiteMeta = z.infer<typeof siteSchema>`

- [ ] **Step 1: 失敗するテストを書く**

`src/data/schema.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { linkItemSchema, linksSchema, newsItemSchema, siteSchema } from './schema';

const goodLink = {
  id: 'instagram',
  label: { ja: 'Instagram', en: 'Instagram' },
  url: 'https://example.com/kumakichi',
  icon: 'instagram',
  enabled: true,
  order: 1,
};

describe('linkItemSchema', () => {
  it('accepts a well-formed https link', () => {
    expect(() => linkItemSchema.parse(goodLink)).not.toThrow();
  });
  it('accepts a mailto url', () => {
    expect(() => linkItemSchema.parse({ ...goodLink, id: 'mail', icon: 'mail', url: 'mailto:a@b.com' })).not.toThrow();
  });
  it('rejects a non-https, non-mailto url', () => {
    expect(() => linkItemSchema.parse({ ...goodLink, url: 'http://insecure.example' })).toThrow();
  });
  it('rejects an unknown icon', () => {
    expect(() => linkItemSchema.parse({ ...goodLink, icon: 'tiktok' })).toThrow();
  });
  it('rejects a missing en label', () => {
    expect(() => linkItemSchema.parse({ ...goodLink, label: { ja: 'あ' } })).toThrow();
  });
});

describe('linksSchema', () => {
  it('rejects duplicate ids', () => {
    expect(() => linksSchema.parse([goodLink, { ...goodLink }])).toThrow(/duplicate/i);
  });
});

describe('newsItemSchema', () => {
  it('accepts an ISO date', () => {
    expect(() => newsItemSchema.parse({ date: '2026-09-01', title: { ja: 'あ', en: 'a' } })).not.toThrow();
  });
  it('rejects a non-ISO date', () => {
    expect(() => newsItemSchema.parse({ date: '2026/09/01', title: { ja: 'あ', en: 'a' } })).toThrow();
  });
  it('rejects an impossible date', () => {
    expect(() => newsItemSchema.parse({ date: '2026-13-40', title: { ja: 'あ', en: 'a' } })).toThrow();
  });
});

describe('siteSchema', () => {
  it('rejects an invalid email', () => {
    expect(() =>
      siteSchema.parse({
        handle: 'kumakichi55',
        email: 'not-an-email',
        domain: 'kumakichi55.com',
        copyrightName: { ja: 'くまきち', en: 'Kumakichi' },
        profile: { ja: 'あ', en: 'a' },
        slideshow: { intervalMs: 5000, fadeMs: 900 },
      }),
    ).toThrow();
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npm test -- src/data/schema.test.ts`
Expected: FAIL（`Cannot find module './schema'`）

- [ ] **Step 3: 最小実装を書く**

`src/data/schema.ts`:

```ts
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
```

- [ ] **Step 4: テストが通ることを確認**

Run: `npm test -- src/data/schema.test.ts`
Expected: PASS（全 12 テスト）

- [ ] **Step 5: コミット**

```bash
git add src/data/schema.ts src/data/schema.test.ts
git commit -m "feat: Zod schemas for links, news, and site data"
```

---

## Task 6: 新着Info セレクタ（純関数・TDD）

**Files:**
- Create: `src/lib/news.ts`, `src/lib/news.test.ts`

**Interfaces:**
- Consumes: `NewsItem` from `src/data/schema.ts`
- Produces: `export function selectNews(items: readonly NewsItem[], limit: number): NewsItem[]` — `date` 降順、先頭 `limit` 件。入力は変更しない。

- [ ] **Step 1: 失敗するテストを書く**

`src/lib/news.test.ts`:

```ts
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
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npm test -- src/lib/news.test.ts`
Expected: FAIL（`Cannot find module './news'`）

- [ ] **Step 3: 最小実装を書く**

`src/lib/news.ts`:

```ts
import type { NewsItem } from '../data/schema';

/** Most-recent-first, capped at `limit`. Pure: input is not mutated. */
export function selectNews(items: readonly NewsItem[], limit: number): NewsItem[] {
  return [...items]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, limit);
}
```

- [ ] **Step 4: テストが通ることを確認**

Run: `npm test -- src/lib/news.test.ts`
Expected: PASS（4 tests）

- [ ] **Step 5: コミット**

```bash
git add src/lib/news.ts src/lib/news.test.ts
git commit -m "feat: news selector (sort desc + limit)"
```

---

## Task 7: データファイルと仮ヒーロー写真

**Files:**
- Create: `scripts/make-placeholders.mjs`, `src/assets/hero/hero-1.jpg`, `src/assets/hero/hero-2.jpg`, `src/assets/hero/hero-3.jpg`, `src/data/site.ts`, `src/data/links.ts`, `src/data/news.ts`

**Interfaces:**
- Consumes: `siteSchema`/`linksSchema`/`newsSchema` from `src/data/schema.ts`
- Produces:
  - `src/data/site.ts`: `export const site: SiteMeta`、`export const heroImages: HeroImage[]`（1件以上）、`export interface HeroImage { src: ImageMetadata; alt: { ja: string; en: string } }`
  - `src/data/links.ts`: `export const links: LinkItem[]`（order昇順・検証済み）、`export const enabledLinks: LinkItem[]`
  - `src/data/news.ts`: `export const news: NewsItem[]`（検証済み・初期は空配列）

- [ ] **Step 1: 仮写真生成スクリプトを作成**

`scripts/make-placeholders.mjs`:

```js
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const dir = fileURLToPath(new URL('../src/assets/hero/', import.meta.url));
await mkdir(dir, { recursive: true });

const tones = [
  { name: 'hero-1.jpg', bg: { r: 214, g: 205, b: 187 } },
  { name: 'hero-2.jpg', bg: { r: 217, g: 201, b: 178 } },
  { name: 'hero-3.jpg', bg: { r: 206, g: 197, b: 179 } },
];

for (const tone of tones) {
  await sharp({ create: { width: 1200, height: 1500, channels: 3, background: tone.bg } })
    .jpeg({ quality: 80 })
    .toFile(dir + tone.name);
}

console.log('wrote 3 placeholder hero images to src/assets/hero/');
```

- [ ] **Step 2: 実行して仮写真を作る**

```bash
node scripts/make-placeholders.mjs
```

Expected: `src/assets/hero/hero-1.jpg` `hero-2.jpg` `hero-3.jpg` が生成される。

- [ ] **Step 3: `src/data/site.ts` を作成**

```ts
import type { ImageMetadata } from 'astro';
import { siteSchema, type SiteMeta } from './schema';

import hero1 from '../assets/hero/hero-1.jpg';
import hero2 from '../assets/hero/hero-2.jpg';
import hero3 from '../assets/hero/hero-3.jpg';

export const site: SiteMeta = siteSchema.parse({
  handle: 'kumakichi55',
  email: 'CHANGE-ME@example.com',
  domain: 'kumakichi55.com',
  copyrightName: { ja: 'くまきち', en: 'Kumakichi' },
  profile: {
    ja: '［プロフィール文をここに］',
    en: '[Profile text goes here]',
  },
  slideshow: { intervalMs: 5000, fadeMs: 900 },
});

export interface HeroImage {
  src: ImageMetadata;
  alt: { ja: string; en: string };
}

export const heroImages: HeroImage[] = [
  { src: hero1, alt: { ja: '［写真1の説明］', en: '[Photo 1 description]' } },
  { src: hero2, alt: { ja: '［写真2の説明］', en: '[Photo 2 description]' } },
  { src: hero3, alt: { ja: '［写真3の説明］', en: '[Photo 3 description]' } },
];

if (heroImages.length < 1) {
  throw new Error('site: heroImages must have at least one entry');
}
```

- [ ] **Step 4: `src/data/links.ts` を作成**

```ts
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
```

- [ ] **Step 5: `src/data/news.ts` を作成（初期は空）**

```ts
import { newsSchema, type NewsItem } from './schema';

const raw: NewsItem[] = [
  // 例:
  // { date: '2026-09-01', title: { ja: '新しいLINEスタンプを発売しました', en: 'New LINE stickers are out' },
  //   url: 'https://store.line.me/stickershop/author/CHANGE-ME' },
];

export const news: NewsItem[] = newsSchema.parse(raw);
```

- [ ] **Step 6: 型チェックとビルド**

```bash
npm run check
npm run build
```

Expected: 成功。`dist/_astro/` に最適化されたヒーロー画像が出力される。

- [ ] **Step 7: コミット**

```bash
git add scripts/make-placeholders.mjs src/assets/hero src/data/site.ts src/data/links.ts src/data/news.ts
git commit -m "feat: validated site/links/news data with placeholder hero images"
```

---

## Task 8: アイコン

**Files:**
- Create: `src/lib/icons.ts`

**Interfaces:**
- Consumes: `IconName` from `src/data/schema.ts`
- Produces: `export function icon(name: IconName | 'chevron'): string` — 20px の stroke SVG マークアップ文字列（`currentColor`）。`.astro` 側で `set:html` に渡す。

- [ ] **Step 1: `src/lib/icons.ts` を作成**

```ts
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
```

- [ ] **Step 2: 型チェック**

Run: `npm run check`
Expected: PASS（`Record<IconName | 'chevron', string>` が8アイコン＋chevronを全て要求）。

- [ ] **Step 3: コミット**

```bash
git add src/lib/icons.ts
git commit -m "feat: inline stroke icon set"
```

---

## Task 9: 解析ヘルパーと Base レイアウト

**Files:**
- Create: `src/lib/analytics.ts`, `src/layouts/Base.astro`
- Modify: `src/pages/index.astro`（Base を使う形へ）

**Interfaces:**
- Consumes: `t` from `src/i18n`、`Locale`/`localizedPath` from `src/lib/i18n.ts`
- Produces:
  - `src/lib/analytics.ts`: `window.goatcounter` の型宣言と `export function trackClick(id: string, label?: string): void`
  - `src/layouts/Base.astro`: props `{ locale: Locale }`。`<head>` に title/description/canonical/hreflang/OGP/favicon、`PUBLIC_GOATCOUNTER_CODE` があれば GoatCounter スニペット。`<slot />` を `<body>` の `<main class="mx-auto max-w-[430px]">` に描画。

- [ ] **Step 1: `src/lib/analytics.ts` を作成**

```ts
declare global {
  interface Window {
    goatcounter?: {
      count: (opts: { path: string; title?: string; event?: boolean }) => void;
    };
  }
}

/** Fire a GoatCounter event for an outbound link. Never throws — analytics must not block navigation. */
export function trackClick(id: string, label?: string): void {
  try {
    window.goatcounter?.count({ path: `out-${id}`, title: label ?? id, event: true });
  } catch {
    /* ignore */
  }
}

export {};
```

- [ ] **Step 2: `src/layouts/Base.astro` を作成**

```astro
---
import '@fontsource/zen-old-mincho/400.css';
import '@fontsource/zen-old-mincho/500.css';
import '@fontsource/zen-old-mincho/700.css';
import '../styles/global.css';

import type { Locale } from '../lib/i18n';
import { localizedPath } from '../lib/i18n';
import { t } from '../i18n';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const tr = t(locale);

const canonical = new URL(localizedPath(locale), Astro.site);
const jaHref = new URL('/', Astro.site);
const enHref = new URL('/en/', Astro.site);
const ogImage = new URL('/og.png', Astro.site);

const goatcounter = import.meta.env.PUBLIC_GOATCOUNTER_CODE as string | undefined;
---
<!doctype html>
<html lang={locale}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{tr.meta.title}</title>
    <meta name="description" content={tr.meta.description} />
    <link rel="canonical" href={canonical} />
    <link rel="alternate" hreflang="ja" href={jaHref} />
    <link rel="alternate" hreflang="en" href={enHref} />
    <link rel="alternate" hreflang="x-default" href={jaHref} />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />

    <meta property="og:type" content="website" />
    <meta property="og:title" content={tr.meta.title} />
    <meta property="og:description" content={tr.meta.description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={ogImage} />
    <meta name="twitter:card" content="summary_large_image" />

    {goatcounter && (
      <script
        defer
        data-goatcounter={`https://${goatcounter}.goatcounter.com/count`}
        src="https://gc.zgo.at/count.js"
      ></script>
    )}
  </head>
  <body class="bg-bg text-ink">
    <main class="mx-auto min-h-screen max-w-[430px]">
      <slot />
    </main>
  </body>
</html>
```

- [ ] **Step 3: `src/pages/index.astro` を Base 利用へ**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base locale="ja">
  <p class="p-6 text-muted">準備中</p>
</Base>
```

- [ ] **Step 4: ビルドで確認**

```bash
npm run check
npm run build
```

Expected: 成功。`PUBLIC_GOATCOUNTER_CODE` 未設定なので `dist/index.html` に `goatcounter` の文字列が**含まれない**こと:

```bash
grep -c "goatcounter" dist/index.html || echo "not present (expected)"
```

`dist/index.html` に `<link rel="canonical" href="https://kumakichi55.com/">` と `hreflang="en"` が含まれること。

- [ ] **Step 5: 解析スニペット出力の確認（一時的に env を設定）**

```bash
PUBLIC_GOATCOUNTER_CODE=demo npm run build
grep -o 'data-goatcounter="[^"]*"' dist/index.html
```

Expected: `data-goatcounter="https://demo.goatcounter.com/count"`。確認後、env なしで再ビルドして戻す: `npm run build`。

- [ ] **Step 6: コミット**

```bash
git add src/lib/analytics.ts src/layouts/Base.astro src/pages/index.astro
git commit -m "feat: Base layout with SEO/OGP head and gated GoatCounter"
```

---

## Task 10: LangSwitch と Footer

**Files:**
- Create: `src/components/LangSwitch.astro`, `src/components/Footer.astro`

**Interfaces:**
- Consumes: `Locale`/`alternateLocale`/`localizedPath` from `src/lib/i18n.ts`、`t` from `src/i18n`、`site` from `src/data/site.ts`
- Produces:
  - `LangSwitch.astro`: props `{ locale: Locale }`。相手ロケールのホームへの `<a>`（ピル型）。
  - `Footer.astro`: props `{ locale: Locale }`。`© <年> <名前>` と問い合わせ `mailto:`。

- [ ] **Step 1: `src/components/LangSwitch.astro` を作成**

```astro
---
import type { Locale } from '../lib/i18n';
import { alternateLocale, localizedPath } from '../lib/i18n';
import { t } from '../i18n';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const other = alternateLocale(locale);
const tr = t(locale);
const label = other === 'en' ? tr.nav.toEnglish : tr.nav.toJapanese;
---
<a
  href={localizedPath(other)}
  hreflang={other}
  aria-label={tr.a11y.switchLanguage}
  class="inline-flex items-center rounded-full border border-black/15 bg-bg/90 px-3.5 py-2 text-xs font-semibold tracking-wide backdrop-blur-sm transition hover:bg-white"
>
  {label}
</a>
```

- [ ] **Step 2: `src/components/Footer.astro` を作成**

```astro
---
import type { Locale } from '../lib/i18n';
import { site } from '../data/site';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const year = new Date().getFullYear();
const name = site.copyrightName[locale];
---
<footer class="px-5 pb-11 pt-2 text-[11px] leading-relaxed text-muted">
  © {year} {name}
  <span aria-hidden="true"> · </span>
  <a href={`mailto:${site.email}`} class="underline underline-offset-2">{site.email}</a>
</footer>
```

- [ ] **Step 3: 型チェック**

Run: `npm run check`
Expected: PASS

- [ ] **Step 4: コミット**

```bash
git add src/components/LangSwitch.astro src/components/Footer.astro
git commit -m "feat: language switcher and footer components"
```

---

## Task 11: Hero（写真スライドショー）

**Files:**
- Create: `src/components/Hero.astro`

**Interfaces:**
- Consumes: `heroImages`/`site` from `src/data/site.ts`、`Locale` from `src/lib/i18n.ts`、`t` from `src/i18n`、`LangSwitch.astro`、`astro:assets` の `Image`
- Produces: `Hero.astro` props `{ locale: Locale }`。写真スタック（クロスフェード）＋scrim＋右上に `LangSwitch`＋右下にドット＋左下に名前。末尾の `<script>` で自動送り／ドット手動切替／`prefers-reduced-motion`／`visibilitychange` を制御。

- [ ] **Step 1: `src/components/Hero.astro` を作成**

```astro
---
import { Image } from 'astro:assets';
import type { Locale } from '../lib/i18n';
import { heroImages, site } from '../data/site';
import { t } from '../i18n';
import LangSwitch from './LangSwitch.astro';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const tr = t(locale);
const multiple = heroImages.length > 1;
---
<header class="relative h-[62vh] max-h-[560px] min-h-[360px] overflow-hidden">
  <div
    class="hero-slides absolute inset-0"
    data-interval={site.slideshow.intervalMs}
  >
    {heroImages.map((image, i) => (
      <div
        class="hero-slide absolute inset-0"
        style={`transition: opacity ${site.slideshow.fadeMs}ms ease; opacity: ${i === 0 ? 1 : 0}`}
      >
        <Image
          src={image.src}
          alt={image.alt[locale]}
          widths={[480, 780, 1200]}
          sizes="(min-width: 430px) 430px, 100vw"
          class="h-full w-full object-cover"
          loading={i === 0 ? 'eager' : 'lazy'}
        />
      </div>
    ))}
  </div>

  <div class="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/55 to-transparent"></div>

  <div class="absolute right-4 top-4 z-20">
    <LangSwitch locale={locale} />
  </div>

  {multiple && (
    <div class="hero-dots absolute bottom-4 right-4 z-20 flex gap-2">
      {heroImages.map((_, i) => (
        <button
          type="button"
          class="hero-dot h-2 w-2 rounded-full transition"
          style={`background: ${i === 0 ? '#FFFDF8' : 'rgba(255,253,248,.4)'}`}
          data-goto={i}
          aria-label={`${tr.a11y.photo} ${i + 1}`}
        ></button>
      ))}
    </div>
  )}

  <div class="reveal-1 absolute inset-x-5 bottom-5 z-10">
    <h1 class="font-display text-[2.25rem] leading-tight text-[#FFFDF8] [text-shadow:0_1px_18px_rgba(0,0,0,0.4)]">
      {site.copyrightName[locale]}
    </h1>
    <p class="mt-1 text-xs tracking-wide text-white/90">@{site.handle} · {tr.hero.kind}</p>
  </div>
</header>

<script>
  const box = document.querySelector<HTMLElement>('.hero-slides');
  if (box) {
    const slides = Array.from(box.querySelectorAll<HTMLElement>('.hero-slide'));
    const dots = Array.from(document.querySelectorAll<HTMLButtonElement>('.hero-dot'));
    const interval = Number(box.dataset.interval ?? 5000);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let current = 0;
    let timer: number | undefined;

    const render = (next: number) => {
      current = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.style.opacity = i === current ? '1' : '0';
      });
      dots.forEach((dot, i) => {
        dot.style.background = i === current ? '#FFFDF8' : 'rgba(255,253,248,.4)';
      });
    };

    const stop = () => {
      if (timer !== undefined) {
        clearInterval(timer);
        timer = undefined;
      }
    };

    const start = () => {
      if (reduce || slides.length < 2 || timer !== undefined) return;
      timer = window.setInterval(() => render(current + 1), interval);
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        stop();
        render(Number(dot.dataset.goto ?? 0));
      });
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });

    render(0);
    start();
  }
</script>
```

- [ ] **Step 2: ビルドで検証（Hero を index に一時差し込み）**

`src/pages/index.astro` を一時的に:

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
---
<Base locale="ja">
  <Hero locale="ja" />
</Base>
```

```bash
npm run check
npm run build
```

Expected: 成功。`dist/index.html` に `hero-slides` と `aria-label="写真 1"` が含まれる。`dist/_astro/` に複数解像度の最適化画像。

- [ ] **Step 3: 目視確認**

```bash
npm run preview
```

`http://localhost:4321/` を開き、(a) 3枚が約5秒ごとにクロスフェード、(b) ドットで切替でき自動送りが止まる、(c) OSの「視差効果を減らす」をONにすると自動送りしない、(d) タブを裏にすると停止、を確認。

- [ ] **Step 4: コミット**

```bash
git add src/components/Hero.astro src/pages/index.astro
git commit -m "feat: hero with crossfading photo slideshow"
```

---

## Task 12: NewsList・LinkList・LinkCard

**Files:**
- Create: `src/components/NewsList.astro`, `src/components/LinkCard.astro`, `src/components/LinkList.astro`

**Interfaces:**
- Consumes: `news` from `src/data/news.ts`、`selectNews` from `src/lib/news.ts`、`enabledLinks` from `src/data/links.ts`、`LinkItem` from `src/data/schema.ts`、`icon` from `src/lib/icons.ts`、`t` from `src/i18n`、`Locale`
- Produces:
  - `NewsList.astro` props `{ locale: Locale }` — `news` が空なら**何も描画しない**。
  - `LinkCard.astro` props `{ link: LinkItem; locale: Locale; index: number }` — `<li>` に `<a data-link-id data-link-label>`。`mailto:` 以外は `target="_blank" rel="noopener"`。
  - `LinkList.astro` props `{ locale: Locale }` — `enabledLinks` を並べ、末尾 `<script>` で `a[data-link-id]` の `click`/`auxclick` を委譲して GoatCounter イベント送信。

- [ ] **Step 1: `src/components/NewsList.astro` を作成**

```astro
---
import type { Locale } from '../lib/i18n';
import { news } from '../data/news';
import { selectNews } from '../lib/news';
import { t } from '../i18n';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const tr = t(locale);
const items = selectNews(news, 3);
---
{items.length > 0 && (
  <section class="reveal-2">
    <h2 class="mb-3 font-display text-[11px] uppercase tracking-[0.24em] text-muted">{tr.sections.news}</h2>
    <ul class="flex flex-col gap-1.5">
      {items.map((item) => (
        <li>
          <a href={item.url ?? '#'} class="flex gap-2.5 py-1 text-[12.5px] leading-snug text-muted">
            <span class="shrink-0 tabular-nums text-accent">{item.date.replace(/-/g, '.')}</span>
            <span>{item.title[locale]}</span>
          </a>
        </li>
      ))}
    </ul>
  </section>
)}
```

- [ ] **Step 2: `src/components/LinkCard.astro` を作成**

```astro
---
import type { Locale } from '../lib/i18n';
import type { LinkItem } from '../data/schema';
import { icon } from '../lib/icons';

interface Props {
  link: LinkItem;
  locale: Locale;
  index: number;
}

const { link, locale, index } = Astro.props;
const isMail = link.url.startsWith('mailto:');
const external = isMail ? {} : { target: '_blank', rel: 'noopener' };
---
<li>
  <a
    href={link.url}
    data-link-id={link.id}
    data-link-label={link.label[locale]}
    {...external}
    class="group flex items-center gap-4 border-b border-hairline py-4 text-[15px] transition-[background-color,padding] duration-150 first:border-t hover:bg-[#F2EEE4] hover:pl-3"
    style={`animation-delay: ${(0.05 + index * 0.05).toFixed(2)}s`}
  >
    <span class="shrink-0" set:html={icon(link.icon)} />
    <span class="flex-1">
      {link.label[locale]}
      {link.description && <span class="ml-2 text-xs text-muted">{link.description[locale]}</span>}
    </span>
    <span class="text-[#BEB7A8] transition group-hover:translate-x-0.5 group-hover:text-accent" set:html={icon('chevron')} />
  </a>
</li>
```

- [ ] **Step 3: `src/components/LinkList.astro` を作成**

```astro
---
import type { Locale } from '../lib/i18n';
import { enabledLinks } from '../data/links';
import { t } from '../i18n';
import LinkCard from './LinkCard.astro';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const tr = t(locale);
---
<section class="reveal-3">
  <h2 class="mb-3 font-display text-[11px] uppercase tracking-[0.24em] text-muted">{tr.sections.links}</h2>
  <ul class="flex flex-col">
    {enabledLinks.map((link, index) => <LinkCard link={link} locale={locale} index={index} />)}
  </ul>
</section>

<script>
  const fire = (a: HTMLAnchorElement) => {
    try {
      window.goatcounter?.count({
        path: `out-${a.dataset.linkId}`,
        title: a.dataset.linkLabel || a.dataset.linkId,
        event: true,
      });
    } catch {
      /* analytics must not block navigation */
    }
  };
  document.querySelectorAll<HTMLAnchorElement>('a[data-link-id]').forEach((a) => {
    a.addEventListener('click', () => fire(a));
    a.addEventListener('auxclick', () => fire(a));
  });
</script>
```

- [ ] **Step 4: ビルドで検証**

```bash
npm run check
npm run build
```

Expected: 成功。型・ビルドが通ることを確認（この時点では暫定 index にまだ NewsList/LinkList は挿入していない）。`news` が空配列なので NewsList は最終的に無出力になる想定。

- [ ] **Step 5: コミット**

```bash
git add src/components/NewsList.astro src/components/LinkCard.astro src/components/LinkList.astro
git commit -m "feat: news list and link list/card components with click tracking"
```

---

## Task 13: ページ（ja / en / 404）・favicon・OGP

**Files:**
- Create: `src/pages/en/index.astro`, `src/pages/404.astro`, `public/favicon.svg`, `public/og.png`
- Modify: `src/pages/index.astro`（全セクションを組む）

**Interfaces:**
- Consumes: `Base.astro`、`Hero.astro`、`NewsList.astro`、`LinkList.astro`、`Footer.astro`、`site` from `src/data/site.ts`
- Produces: `/`（ja）、`/en/`（en）、`/404.html`。各ページは同じ構成でロケールだけ差し替え。

- [ ] **Step 1: `src/pages/index.astro`（日本語・最終形）**

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import NewsList from '../components/NewsList.astro';
import LinkList from '../components/LinkList.astro';
import Footer from '../components/Footer.astro';
import { site } from '../data/site';

const locale = 'ja' as const;
---
<Base locale={locale}>
  <Hero locale={locale} />
  <div class="flex flex-col gap-8 px-[22px] pb-11 pt-7">
    <p class="reveal-1 m-0 text-sm leading-relaxed text-muted">{site.profile[locale]}</p>
    <NewsList locale={locale} />
    <LinkList locale={locale} />
  </div>
  <Footer locale={locale} />
</Base>
```

- [ ] **Step 2: `src/pages/en/index.astro`（英語）**

```astro
---
import Base from '../../layouts/Base.astro';
import Hero from '../../components/Hero.astro';
import NewsList from '../../components/NewsList.astro';
import LinkList from '../../components/LinkList.astro';
import Footer from '../../components/Footer.astro';
import { site } from '../../data/site';

const locale = 'en' as const;
---
<Base locale={locale}>
  <Hero locale={locale} />
  <div class="flex flex-col gap-8 px-[22px] pb-11 pt-7">
    <p class="reveal-1 m-0 text-sm leading-relaxed text-muted">{site.profile[locale]}</p>
    <NewsList locale={locale} />
    <LinkList locale={locale} />
  </div>
  <Footer locale={locale} />
</Base>
```

- [ ] **Step 3: `src/pages/404.astro`（日英併記）**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base locale="ja">
  <section class="px-6 py-24 text-center">
    <p class="font-display text-2xl">ページが見つかりません</p>
    <p class="mt-2 text-sm text-muted">Page not found</p>
    <p class="mt-8 text-sm">
      <a href="/" class="text-accent underline underline-offset-2">トップへ / Home</a>
    </p>
  </section>
</Base>
```

- [ ] **Step 4: `public/favicon.svg` を作成（柴犬モチーフの簡易マーク）**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#FAF9F6"/>
  <path d="M8 8l4 3h8l4-3 1 7c0 6-4 10-9 10S7 22 7 16z" fill="none" stroke="#1C1A17" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="13" cy="16" r="1.4" fill="#1C1A17"/>
  <circle cx="19" cy="16" r="1.4" fill="#1C1A17"/>
  <path d="M14.5 20c1 .8 2 .8 3 0" fill="none" stroke="#B45309" stroke-width="1.6" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 5: `public/og.png` を用意（当面プレースホルダー）**

仮の 1200×630 を生成:

```bash
node -e "import('sharp').then(({default:s})=>s({create:{width:1200,height:630,channels:3,background:{r:250,g:249,b:246}}}).png().toFile('public/og.png')).then(()=>console.log('wrote public/og.png'))"
```

（後で実画像に差し替え。ファイル名は `og.png` のまま。）

- [ ] **Step 6: ビルドと目視確認**

```bash
npm run check
npm run build
npm run preview
```

Expected: `dist/index.html`・`dist/en/index.html`・`dist/404.html` が生成。`http://localhost:4321/` と `/en/` で:
- ヒーロー写真スライド、言語トグルで `/` ⇄ `/en/` 往復、リンク8件がフェードイン、ホバーで背景と山括弧が動く、フッターに年とメール。
- `news` が空なので新着セクションは非表示。
- `/存在しないパス` で 404 ページ。

- [ ] **Step 7: コミット**

```bash
git add src/pages public/favicon.svg public/og.png
git commit -m "feat: ja/en/404 pages, favicon, placeholder OGP image"
```

---

## Task 14: 最終検証・README・デプロイ手順

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: これまでの全タスク
- Produces: `README.md`（データ編集・写真差し替え・ローカル実行・デプロイ・DNS の手順）。GitHub 上で Actions による公開が完了している状態。

- [ ] **Step 1: 全チェックを実行**

```bash
npm run check
npm test
npm run build
```

Expected: すべて成功。`vitest` は Task 3/5/6 の 20 テストが PASS。

- [ ] **Step 2: Lighthouse（手動）**

`npm run preview` の後、Chrome DevTools の Lighthouse（Mobile）で `/` と `/en/` を計測。
Performance / Accessibility / Best Practices / SEO いずれも 90 以上を目安。下回る項目があれば
対応（多くは画像サイズ・コントラスト・`aria-label` 漏れ）。

- [ ] **Step 3: `README.md` を作成**

````markdown
# くまきち リンク集サイト

Astro + TypeScript の静的サイト。`main` に push すると GitHub Actions が
ビルドして GitHub Pages（https://kumakichi55.com）へ公開する。

## ローカル

```bash
npm install
npm run dev      # http://localhost:4321
npm run check    # 型・スキーマ
npm test         # 純関数テスト
npm run build    # dist/ を生成
npm run preview  # dist/ を配信
```

## データの編集（コードだけで完結）

| やりたいこと | 触るファイル |
|---|---|
| リンクの追加・並べ替え・一時非表示 | `src/data/links.ts`（`order` で並び、`enabled: false` で非表示） |
| 新着Info | `src/data/news.ts`（`date` は `YYYY-MM-DD`。表示は新しい順に3件） |
| プロフィール文・ハンドル・問い合わせ先・スライド速度 | `src/data/site.ts` |
| UIの文言（「新着」「リンク」など） | `src/i18n/ja.ts` / `src/i18n/en.ts` |
| アクセント色などのトークン | `src/styles/global.css` の `@theme` |

不正な値（URL不正・日付不正・`id` 重複・未知のアイコン）は `npm run build` / `npm run check` で失敗する。

## ヒーロー写真の差し替え

1. 縦長（目安 4:5〜3:4）の写真を `src/assets/hero/` に置く（`hero-1.jpg` 等）。
2. `src/data/site.ts` の `heroImages` を実ファイルの `import` と `alt`（日英）に更新。
3. 枚数は自由。1枚ならスライドは自動でオフ。

## 解析（GoatCounter）

1. https://www.goatcounter.com/ でサイトを作成（例: `kumakichi`）。
2. GitHub リポジトリ → Settings → Secrets and variables → Actions → **Variables** に
   `PUBLIC_GOATCOUNTER_CODE = kumakichi` を追加。
3. ローカルで確認するなら `.env` に同じ行を書く（`.env` は Git 管理外）。

未設定ならスニペットは出力されない（サイトは正常動作）。

## デプロイ（初回セットアップ）

1. GitHub にリポジトリを作成し push（`main`）。
2. リポジトリ Settings → Pages → **Source: GitHub Actions**。
3. 独自ドメイン: `public/CNAME` に `kumakichi55.com`（設定済み）。
4. DNS（ドメイン管理会社側）:
   - `@`（apex）: A レコード 4件
     `185.199.108.153` / `185.199.109.153` / `185.199.110.153` / `185.199.111.153`
     （必要に応じ AAAA も）
   - `www`: CNAME → `<GitHubユーザー名>.github.io`
5. 反映後、Settings → Pages で **Enforce HTTPS** を有効化。
6. `kumakichi.tech` は当面このサイトへ 301 リダイレクト（管理会社の機能）、または将来用に保留。
````

- [ ] **Step 4: コミット**

```bash
git add README.md
git commit -m "docs: README with data-editing and deploy runbook"
```

- [ ] **Step 5: リモート作成と push（ユーザーの GitHub 認証が必要）**

`gh` CLI が使える場合:

```bash
gh repo create kumakichi-linktree --private --source=. --remote=origin --push
```

使えない場合は GitHub でリポジトリを作成し:

```bash
git remote add origin https://github.com/<user>/kumakichi-linktree.git
git branch -M main
git push -u origin main
```

- [ ] **Step 6: 公開の確認**

GitHub → Actions で `Deploy to GitHub Pages` が成功していること。Settings → Pages に
公開URLが出ること。DNS 反映後 `https://kumakichi55.com/` と `/en/` が表示されること。

---

## Self-Review 結果（この計画の作成者による確認）

**1. Spec カバレッジ**

| Spec セクション | 対応タスク |
|---|---|
| 2 技術スタック | Task 1（Astro/TS/Tailwind/Vitest/依存）、Task 2（フォント） |
| 3 サイト構成・セクション | Task 11（ヒーロー）、Task 12（新着・リンク）、Task 13（ページ/404）、Task 10（言語トグル・フッター） |
| 4 デザイントークン | Task 2（`@theme`・`@keyframes`・reduced-motion・focus-visible） |
| 5 データモデル＋検証 | Task 5（スキーマ）、Task 7（site/links/news）、Task 4（辞書） |
| 6 コンポーネント構成 | Task 8〜13 |
| 7 i18n 方式 | Task 1（config）、Task 3（純関数）、Task 9（hreflang/canonical）、Task 10（切替） |
| 8 画像 | Task 7（仮写真＋`astro:assets`）、Task 13（favicon/OGP） |
| 9 解析 | Task 9（Base スニペット gate）、Task 12（クリック委譲） |
| 10 デプロイ | Task 1（workflow/CNAME）、Task 14（Pages 設定・DNS・push） |
| 11 エラーハンドリング | Task 5（スキーマ）、Task 7（heroImages≥1）、Task 12（news 空で非表示） |
| 12 テスト | Task 3/5/6（Vitest）、各タスクの `check`+`build`、Task 14（Lighthouse） |
| 13 ディレクトリ構成 | File Structure 節と各 Task の Files |
| 14 プレースホルダー | Task 7（`CHANGE-ME`・`［…］`）、Task 13（favicon/OGP 仮） |

**2. プレースホルダー走査**: 「TBD」「後で」「適宜」等の曖昧ステップなし。各コードステップは完全なコードを含む。

**3. 型整合**: `Locale` / `LinkItem` / `NewsItem` / `IconName` / `Dict` / `SiteMeta` / `HeroImage` は定義タスクと利用タスクで名称・形が一致。関数名 `localizedPath` / `alternateLocale` / `isLocale` / `selectNews` / `trackClick` / `icon` / `t` は全参照箇所で一致。GoatCounter 呼び出しは `window.goatcounter?.count({ path, title, event })` で統一。
