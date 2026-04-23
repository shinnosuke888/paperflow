# PaperFlow

PaperFlow は、arXiv の公開論文を X ライクなタイムラインで閲覧し、気になった論文を保存・共有できる Next.js アプリです。

## Features

- Supabase Auth を使ったメール / パスワード認証
- arXiv API からの論文タイムライン取得
- Gemini API を使ったタイトル / Abstract の日本語翻訳
- Supabase にお気に入り保存
- X 共有ボタン
- Vercel デプロイ前提の App Router 構成

## Stack

- Next.js 16
- React 19
- Supabase Auth / Postgres
- arXiv API
- Gemini API
- Vercel

## Local Setup

1. Node.js 20.9 以上を用意します。
2. 依存関係をインストールします。

```bash
npm install
```

3. `.env.example` を元に `.env.local` を作成し、Supabase の URL / Publishable Key と `GEMINI_API_KEY` を設定します。
4. Supabase で [`supabase/migrations/202604210001_create_favorite_papers.sql`](supabase/migrations/202604210001_create_favorite_papers.sql) を実行します。
5. 開発サーバーを起動します。

```bash
npm run dev
```

## Supabase Auth Settings

Supabase のメール確認フローを SSR で動かすため、以下を設定してください。

1. Authentication の Redirect URLs に次を追加します。
   - `http://localhost:3000/auth/confirm`
   - `https://<your-vercel-domain>/auth/confirm`
2. Confirm signup のメールテンプレートを次の URL 形式に変更します。

```txt
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

## Vercel Deploy

1. このリポジトリを Vercel に接続します。
2. 次の環境変数を Vercel に設定します。
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
   - `GEMINI_API_KEY`
3. Supabase 側の Redirect URLs に本番ドメインを追加します。

## Gemini Translation

- 一覧ページと詳細ページでは、Gemini API を使って論文タイトルと Abstract を日本語に翻訳します。
- `GEMINI_API_KEY` が未設定の場合は、原文のまま表示されます。

## Project Structure

```txt
app/
  login/           認証 UI と server actions
  api/favorites/   お気に入り保存 API
  auth/confirm/    メール確認ハンドラ
components/        UI コンポーネント
lib/               arXiv / Supabase / ユーティリティ
supabase/migrations/
```
