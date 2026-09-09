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
