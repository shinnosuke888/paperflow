# PaperFlow Rebuild And Teardown

このドキュメントは、PaperFlow を一度削除したあとでも短時間で再構築できるように、必要な設定と削除手順をまとめた運用メモです。

## 現在の構成

- GitHub repository: `shinnosuke888/paperflow`
- Vercel project: `paperflow`
- Production URL: `https://paperflow-beryl.vercel.app`
- Optional production alias: `https://paperflow-git-main-shinnosuke888.vercel.app`
- Supabase project ref: `sbzqzakqqzxvbnnfhnds`

## 再構築に必要なもの

### コード

- このリポジトリ一式
- `supabase/migrations/202604210001_create_favorite_papers.sql`
- `app/auth/confirm/route.ts`
- `app/login/actions.ts`

### Vercel 環境変数

値そのものは Git に入れず、パスワードマネージャや安全なメモに保存すること。

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `GEMINI_API_KEY`

### Supabase Auth 設定

#### Site URL

```txt
https://paperflow-beryl.vercel.app
```

#### Redirect URLs

```txt
http://localhost:3000/auth/confirm
https://paperflow-beryl.vercel.app/auth/confirm
https://paperflow-git-main-shinnosuke888.vercel.app/auth/confirm
```

#### Confirm signup メールテンプレート

```html
<p><a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email">Confirm your mail</a></p>
```

## 削除前に残すもの

### 1. GitHub に最新コードを残す

- `main` に最新コードを push する
- 可能ならタグを打つ  
  例: `paperflow-v1`

### 2. DB スキーマを確定する

すでにこのリポジトリにはお気に入り保存用 migration があります。  
もし Supabase ダッシュボード上で追加変更をしたなら、削除前に migration として取り込みます。

Supabase 公式:
- Local development with schema migrations: https://supabase.com/docs/guides/cli/local-development

例:

```bash
supabase login
supabase link --project-ref sbzqzakqqzxvbnnfhnds
supabase db pull
```

### 3. 必要ならデータをダンプする

「アプリの定義だけ残せばよい」のか、「お気に入りデータも残したい」のかを分けて考える。

- 定義だけ残す  
  GitHub と migration だけで十分
- データも残す  
  Supabase の dump を取る

Supabase 公式:
- CLI `db dump`: https://supabase.com/docs/reference/cli/supabase-db-dump
- Backups: https://supabase.com/docs/guides/platform/backups

例:

```bash
supabase db dump --db-url [CONNECTION_STRING] -f backups/roles.sql --role-only
supabase db dump --db-url [CONNECTION_STRING] -f backups/schema.sql
supabase db dump --db-url [CONNECTION_STRING] -f backups/data.sql --use-copy --data-only -x "storage.buckets_vectors" -x "storage.vector_indexes"
```

注意:
- Supabase プロジェクトを削除すると、関連データとバックアップは恒久的に削除される
- Storage を使う構成なら、DB backup だけではオブジェクト本体は戻らない

### 4. 本番設定を記録する

最低限、次を安全な場所に保存する。

- Vercel の環境変数名と値
- Supabase `Site URL`
- Supabase `Redirect URLs`
- Supabase `Confirm signup` メールテンプレート
- 本番URL

## 削除の順番

### 最小リスクの順番

1. GitHub に最新コードを push
2. 必要なら Supabase の dump を取得
3. Vercel / Supabase の設定値を保存
4. Vercel project を削除
5. Supabase project を削除

### Vercel project の削除

Vercel 公式:
- Managing projects: https://vercel.com/docs/projects/managing-projects

ダッシュボードから削除する場合:

1. Vercel で対象 project を開く
2. `Settings`
3. `General` の一番下までスクロール
4. `Delete Project`

### Supabase project の削除

Supabase 公式:
- `supabase projects delete`: https://supabase.com/docs/reference/cli/supabase-projects-delete
- Delete project note: https://supabase.com/docs/guides/platform/backups

ダッシュボードから削除する場合:

1. Supabase project を開く
2. Project Settings を開く
3. `Delete project`

CLI 例:

```bash
supabase projects delete sbzqzakqqzxvbnnfhnds
```

## 再構築の手順

### 1. GitHub から取得

```bash
git clone https://github.com/shinnosuke888/paperflow.git
cd paperflow
npm install
```

### 2. 新しい Supabase project を作る

- 新規 project 作成
- `Project URL`
- `Publishable Key`
- `Database Password`
を控える

### 3. DB を戻す

最小構成なら migration を実行する。

```txt
supabase/migrations/202604210001_create_favorite_papers.sql
```

データも戻したいなら、必要に応じて dump を restore する。

### 4. Auth 設定を戻す

- `Site URL`
- `Redirect URLs`
- `Confirm signup` メールテンプレート

をこのドキュメントに合わせて再設定する。

### 5. Vercel を再接続する

- GitHub repository を import
- 環境変数を追加
- `main` を production deploy

### 6. 動作確認

- 未ログインで一覧が見える
- 詳細ページが開く
- 新規登録できる
- メール確認後にログインできる
- 保存できる
- Gemini 翻訳が表示される

## CloudFormation 的にもっと固めたい場合

今の状態は「コード + 手順書 + migration」でかなり再現可能ですが、完全な Infrastructure as Code ではありません。

次に進めるなら候補はこの2つです。

- Terraform
- Pulumi

管理対象の候補:

- Vercel project
- Vercel environment variables
- Supabase project 作成
- Supabase config
- Auth 設定

ただし最初の一歩としては、このリポジトリと本ドキュメントを残してから削除する運用で十分です。
