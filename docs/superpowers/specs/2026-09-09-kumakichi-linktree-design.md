# くまきち リンク集サイト 設計ドキュメント

- **日付**: 2026-09-09
- **ステータス**: レビュー待ち（実装計画の前段）
- **対象ドメイン**: `kumakichi55.com`（取得済み）

---

## 1. 概要と目的

柴犬「くまきち」の各SNS・グッズ・LINEへの導線を1ページに集約した、自前運用の
Linktree 相当サイト。既存の Linktree/lit.link 等のサービスに依存せず、独自ドメインで
公開し、見た目（おしゃれ・写真フォワード）とデータ管理を自分でコントロールする。

副次目的として、オーナー（ryota）の TypeScript / モダンフロントエンド学習の題材にする。

### ゴール

- 1ページで全リンクに到達できる。モバイル最優先。
- 「ミニマル／モダン」×「写真フォワード」の見た目（採用案 = 案A: 全面ポートレート）。
- 日本語（`/`）と英語（`/en/`）の2ロケール。
- リンク・新着Info・プロフィールを**型付きデータファイルの編集 + push** だけで更新できる。
- どのリンクが押されたかをプライバシー配慮型の解析で計測。
- GitHub へ push すると自動ビルド＆公開（GitHub Pages）。

### 非ゴール（YAGNI・今回やらない）

- CMS・管理画面（データはコード内）。
- ブログ／記事一覧などの追加ページ（将来 `.tech` 側で検討）。
- ダークモード。
- OGP画像の動的生成（当面は固定1枚）。
- ユーザー投稿・コメント・フォーム送信（問い合わせは `mailto:` のみ）。
- 3ロケール目以降。

---

## 2. 技術スタック

| 項目 | 採用 | 理由 |
|---|---|---|
| フレームワーク | **Astro 5**（静的出力） | ビルド結果が純HTML。GitHub Pages に最適。TypeScript ファーストクラス。 |
| 言語 | **TypeScript**（`strict`） | 学習目的。データを型で守る。 |
| スタイル | **Tailwind CSS v4**（`@tailwindcss/vite`、CSS-first。`tailwind.config.*` は作らず `src/styles/global.css` の `@theme` にトークンを定義） | ミニマルなUIを素早く。トークンで色・間隔を一元管理。 |
| フォント | `@fontsource/zen-old-mincho`（見出し）＋ システムフォント/Noto Sans JP（本文） | 明朝の品位を自己ホストで（Google Fonts への実行時依存なし）。 |
| データ検証 | Astro Content Collections + **Zod** スキーマ | 不正データはビルド時に落とす。 |
| 解析 | **GoatCounter**（無料・Cookieレス・同意バナー不要） | ページビュー＋リンク別クリックイベントを計測できる。 |
| ホスティング | **GitHub Pages** + **GitHub Actions**（`withastro/action`） | push で自動デプロイ。無料。独自ドメイン対応。 |

Node は開発時のみ必要（ローカル: `v24`、CI: LTS を明示）。

---

## 3. サイト構成

1ページ構成。ロケールごとに実URLを分ける。

```
kumakichi55.com/         日本語（defaultLocale, プレフィックスなし）
kumakichi55.com/en/      英語
kumakichi55.com/404      404（日英併記の簡易ページ）
```

### ページ内セクション（採用案A: 全面ポートレート）

1. **ヒーロー**（`Hero.astro` + `HeroSlideshow`）
   - 画面上部に大きな縦長写真。複数枚を**自動クロスフェード**（既定 5000ms 間隔／フェード 900ms）。
   - 右下に小さいドット。タップで手動切替 → 自動送りは停止。
   - `prefers-reduced-motion` では自動送りなし（ドットのみ）。タブ非表示中は停止（`visibilitychange`）。
   - 写真の上に暗いグラデーション（scrim）、その上に名前（明朝・大）＋ `@kumakichi55 · 柴犬 / Shiba Inu`。
   - 右上に言語トグル（`/` ⇄ `/en/` の相互リンク。JSは不要、`<a>` で実装）。
2. **プロフィール**: 1〜2行の本文（`site.profile`）。
3. **新着 Info**（`NewsList.astro`）: `news.ts` を日付降順で上位N件（既定3件）。各行「日付＋一言＋任意リンク」。
4. **リンク一覧**（`LinkList.astro` + `LinkCard.astro`）: `links.ts` を `order` 昇順、`enabled` のみ表示。
   1px罫線の静かな行（アイコン＋ラベル＋山括弧）。ホバー/フォーカスで背景と山括弧が動く。
   読み込み時に上方向へ薄くフェードイン（stagger）。
5. **フッター**: `© <年> くまきち` ＋ 問い合わせ `mailto:`。

### リンクの既定並び順

Instagram → X → Threads → note → LINE スタンプ → LINE 絵文字 → SUZURI → メールで問い合わせ

（`links.ts` の `order` で自由に変更可。導線: 日常発信 → 読み物 → 買えるもの → 連絡）

---

## 4. デザイントークン

`src/styles/global.css` の Tailwind v4 `@theme` ブロックで一元管理（`tailwind.config.*` は作らない）。

| トークン | 値（既定） | 用途 |
|---|---|---|
| `--bg` | `#FAF9F6`（温かいオフホワイト） | 背景 |
| `--ink` | `#1C1A17`（近黒） | 本文 |
| `--muted` | `#6B6558` | 補助テキスト |
| `--hairline` | `#E6E1D8` | 罫線 |
| `--accent` | `#B45309`（柴の茶〜オレンジ） | ホバー・日付・フォーカスリング |
| 見出し書体 | Zen Old Mincho | 名前・セクションラベル |
| 本文書体 | system-ui / Hiragino / Noto Sans JP | それ以外 |

- モーション: フェード/トランジションは 0.15–0.95s、`cubic-bezier(.2,.7,.2,1)`。派手な演出は入れない。
- アクセシビリティ: `:focus-visible` に 2px アクセントのアウトライン。タップ領域 44px 以上。
  画像に `alt`。`<html lang>` と `hreflang` を出力。コントラスト比 AA 以上。

---

## 5. データモデル

すべて TypeScript。実行時フェッチなし（ビルド時にバンドル）。

### 5.1 `src/data/site.ts`

```ts
export interface SiteData {
  handle: string;            // "kumakichi55"
  email: string;             // 問い合わせ先
  domain: string;            // "kumakichi55.com"
  copyrightName: { ja: string; en: string };
  profile: { ja: string; en: string };
  heroImages: {
    src: ImageMetadata;      // import した画像（astro:assets）
    alt: { ja: string; en: string };
  }[];
  slideshow: { intervalMs: number; fadeMs: number }; // 既定 { 5000, 900 }
}
```

### 5.2 `src/data/links.ts`

```ts
export type IconName =
  | "instagram" | "x" | "threads" | "note"
  | "line-stickers" | "line-emoji" | "suzuri" | "mail";

export interface LinkItem {
  id: string;                          // 一意。解析イベント名に使う（"instagram" 等）
  label: { ja: string; en: string };
  url: string;                         // 絶対URL。mail は "mailto:..."
  icon: IconName;
  description?: { ja: string; en: string };
  enabled: boolean;
  order: number;
}
```

例:

```ts
{ id: "instagram", label: { ja: "Instagram", en: "Instagram" },
  url: "https://www.instagram.com/kumakichi55/", icon: "instagram",
  enabled: true, order: 1 }
```

### 5.3 `src/data/news.ts`

```ts
export interface NewsItem {
  date: string;                        // ISO 8601 "YYYY-MM-DD"（例 "2026-09-01"）
  title: { ja: string; en: string };
  url?: string;                        // 任意。詳細先
}
export const news: NewsItem[] = [ /* 新しい順でも可。表示側で降順ソート */ ];
```

表示は `date` 降順で `NEWS_LIMIT`（既定3）件。

### 5.4 i18n 辞書 `src/i18n/{ja,en}.ts`

UIラベルのみ（データではなく文言）:

```ts
export default {
  nav: { language: "日本語" | "English" },
  sections: { news: "新着" | "News", links: "リンク" | "Links" },
  a11y: { switchLanguage: "…", slidePrefix: "写真 " | "Photo " },
};
```

### 5.5 検証

`src/content.config.ts` または各データファイルの `parse` 時に Zod で:

- `url` は `z.string().url()`（`mailto:` は別途許可）。
- `news.date` は `z.string().regex(/^\d{4}-\d{2}-\d{2}$/)` かつ実在日。
- `links` の `id` はユニーク、`icon` は `IconName` に限定。
- `heroImages` は 1 枚以上。

不正時は `astro build` / `astro check` が失敗する（= 回帰テスト）。

---

## 6. コンポーネント構成

| ファイル | 役割 | 依存 |
|---|---|---|
| `src/layouts/Base.astro` | `<head>`（title/description/OGP/`hreflang`/canonical）、`<html lang>`、GoatCounter スニペット、グローバルCSS | `site.ts` |
| `src/pages/index.astro` | 日本語ページ。`locale="ja"` を各コンポーネントへ | Base, 各セクション |
| `src/pages/en/index.astro` | 英語ページ。`locale="en"` | 同上 |
| `src/pages/404.astro` | 日英併記の簡易404 | Base |
| `src/components/Hero.astro` | 写真スライド＋名前＋言語トグル | `site.ts`, i18n |
| `src/components/HeroSlideshow.astro` | クロスフェードの島。マークアップ＋末尾の inline `<script>`（TypeScript）で `intervalMs` / `fadeMs` / 画像枚数を受け取り制御 | — |
| `src/components/NewsList.astro` | 新着Info | `news.ts` |
| `src/components/LinkList.astro` | リンク一覧のラッパ（ソート・フィルタ） | `links.ts` |
| `src/components/LinkCard.astro` | 1リンク行。`data-link-id` を持ち、クリックで `trackClick` | `icons` |
| `src/components/LangSwitch.astro` | `/` ⇄ `/en/` の相互リンク | i18n |
| `src/components/Footer.astro` | 著作権＋mailto | `site.ts` |
| `src/lib/icons.ts` | `IconName → インラインSVG` の対応（stroke ベース・20/21px） | — |
| `src/lib/analytics.ts` | `trackClick(id: string, label?: string)` | GoatCounter |
| `src/lib/i18n.ts` | `locale` 型、`t(locale)`、`localizedPath()` | 辞書 |

島は最小限（スライドショーのみ JS）。それ以外は静的HTML＋CSS。

---

## 7. i18n 方式

- `astro.config.mjs`:
  ```js
  i18n: {
    defaultLocale: "ja",
    locales: ["ja", "en"],
    routing: { prefixDefaultLocale: false },
  }
  ```
- 文言は 5.4 の辞書。リンク先URL・写真は基本ロケール非依存（`label`/`alt`/`description` のみ多言語）。
- `LangSwitch` は現在ロケールの相手URLへ（`/` ↔ `/en/`）。
- `Base.astro` で `<link rel="alternate" hreflang="ja|en|x-default">` と `<link rel="canonical">` を出力。

---

## 8. 画像

- 原本は `src/assets/hero/` に置き、`site.ts` で `import` → `astro:assets` の `<Image>` /
  `getImage()` で WebP/AVIF・複数解像度を自動生成。
- ヒーローは縦長（目安 4:5〜3:4）、1〜数枚。`loading="eager"` は先頭のみ、以降は遅延。
- リンクアイコンはSVG（`src/lib/icons.ts`、`currentColor`）。ブランドロゴは Simple Icons 準拠の
  簡易ラインで開始し、必要に応じ差し替え。
- favicon: 柴犬モチーフの `favicon.svg`（`public/`）。
- OGP: `public/og.png`（固定1枚、1200×630）を当面使用。

---

## 9. 解析（GoatCounter）

- `Base.astro` の `<head>` に GoatCounter の `count.js`（`data-goatcounter="https://<code>.goatcounter.com/count"`）。
- ページビューは自動。
- **リンク別クリック**: `LinkCard` の `<a>` に `data-link-id` を付け、`analytics.ts` の
  `trackClick(id, label)` が `window.goatcounter.count({ path: "out-" + id, title: label, event: true })` を送る。
  `<a target="_blank">` でも計測が飛ぶよう `click`（+ `auxclick`）で発火。
- GA4 は使わない（重い・同意管理が必要）。
- 環境変数 `PUBLIC_GOATCOUNTER_CODE` 未設定時はスニペットを出力しない（ローカル開発でノイズを出さない）。

---

## 10. デプロイ

### 10.1 GitHub リポジトリ + Actions

- 新規リポジトリ（例 `kumakichi-linktree`）。デフォルトブランチ `main`。
- `.github/workflows/deploy.yml`: `withastro/action`（`main` への push で `astro build` → Pages へ）。
- リポジトリ設定 → Pages のソースを「GitHub Actions」に。

### 10.2 Astro 設定

```js
site: "https://kumakichi55.com",
base: "/",
```

### 10.3 独自ドメイン

- `public/CNAME` に `kumakichi55.com`。
- DNS（ドメイン管理会社側）:
  - Apex `@`: A レコード `185.199.108.153` / `185.199.109.153` / `185.199.110.153` / `185.199.111.153`
    （AAAA も併せて設定可）。
  - `www`: CNAME → `<github-user>.github.io`。
- GitHub Pages 側で「Enforce HTTPS」を有効化（証明書発行後）。
- スクショ上 `kumakichi55.com` のネームサーバーが「その他」だったため、現在の向き先を確認してから
  上記に置換する手順を実装計画に含める。

### 10.4 `kumakichi.tech`

このサイトには使わない。`kumakichi55.com` へ 301 リダイレクト（管理会社のリダイレクト機能）、
または将来の技術ブログ用に保留。

---

## 11. エラーハンドリング

| 事象 | 挙動 |
|---|---|
| データ型/スキーマ不正（URL不正・日付不正・`id`重複・`icon`不明） | `astro check` / `astro build` が失敗。CIで検出。 |
| ヒーロー画像0枚 | ビルド失敗（Zodで1枚以上を要求）。 |
| 画像ファイル欠落 | `import` 解決失敗でビルドエラー。 |
| `news` が空 | 新着セクションを丸ごと非表示（エラーにしない）。 |
| `enabled:true` のリンクが0件 | リンクセクションの見出しのみ表示（想定外なのでレビューで気づける）。 |
| 解析コード未設定 | スニペット非出力。サイトは正常動作。 |
| 未知のパス | `404.astro` を表示。 |

---

## 12. テスト

規模的にユニットテストは最小限。

- **CI 必須**: `astro check`（型・スキーマ）＋ `astro build`（生成の成否）。これが実質の回帰テスト。
- **軽量ユニット**（Vitest、計画に含める）: `i18n.localizedPath()`（`/` ⇄ `/en/` の相互変換）と
  `news` の降順ソート＋件数制限。ロジックはこの2箇所のみ純関数として切り出す。
- **手動**: 主要ブラウザ実機でヒーロー切替／言語トグル／リンク遷移、Lighthouse（Performance・
  Accessibility・SEO 90+ 目安）、`prefers-reduced-motion` 時の挙動、モバイル幅で崩れがないこと。

---

## 13. ディレクトリ構成（概略）

```
kumakichi-linktree/
  astro.config.mjs
  tailwind.config.mjs          # または CSS 変数中心
  tsconfig.json                # strict
  package.json
  .github/workflows/deploy.yml
  public/
    CNAME                      # kumakichi55.com
    favicon.svg
    og.png
  src/
    assets/hero/               # くまきちの写真原本
    components/  Hero / HeroSlideshow / NewsList / LinkList / LinkCard / LangSwitch / Footer
    data/        site.ts / links.ts / news.ts
    i18n/        ja.ts / en.ts
    lib/         icons.ts / analytics.ts / i18n.ts
    layouts/     Base.astro
    pages/       index.astro / en/index.astro / 404.astro
    styles/      global.css
  docs/superpowers/specs/2026-09-09-kumakichi-linktree-design.md
```

---

## 14. 実装前に埋める項目（プレースホルダー）

| 項目 | 現状 | 必要なもの |
|---|---|---|
| ヒーロー写真 | 仮ブロック×3 | 縦長の高解像度写真 数枚（`src/assets/hero/`）＋各altの日英 |
| プロフィール文 | `［プロフィール文をここに］` | 1〜2行の日本語＋英語 |
| 新着 Info | サンプル2件 | 初期の実データ（無ければ空でローンチ可） |
| 各リンクURL | `#` | Instagram / X / Threads / note / LINEスタンプ / LINE絵文字 / SUZURI の実URL |
| 問い合わせメール | `kuma-kichi [at] example.com` | 実アドレス |
| アクセントカラー | `#B45309` | 確定 or 変更指示 |
| GoatCounter | 未 | `goatcounter.com` でサイトコード発行 → `PUBLIC_GOATCOUNTER_CODE` |
| favicon | 未 | `public/favicon.svg`（柴犬モチーフの簡易SVG。実装時に作成、後で差し替え可） |
| OGP画像 | 未 | `public/og.png`（1200×630、当面固定） |
| DNS | 未設定 | 管理会社での A/AAAA・CNAME 設定（手順は計画に同梱） |

---

## 15. 将来拡張（今回スコープ外）

- OGP画像の自動生成（Satori/`astro-og-canvas`）。
- `kumakichi.tech` での技術ブログ（Astro Content Collections）。
- ダークモード。
- 新着Infoの専用ページ（件数が増えたら）。
- 写真スライドにKen Burns（ゆっくりズーム）。
- ビルド後のリンク切れ自動チェック（CI後段）。
