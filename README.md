# コマ相wiki

マイクラコマンド相談所の公式Wikiです。Next.js、Supabase、Vercelを使用して構築されています。

## 機能

- Discord OAuth認証
- ロールベースのアクセス制御
- Wikiページの作成、編集、削除
- Admin権限でのフル管理

## セットアップ

1. リポジトリをクローン
2. 依存関係をインストール: `npm install`
3. 環境変数を設定: `.env.example` を `.env.local` にコピーして値を入力
4. Supabaseプロジェクトを作成し、データベースを設定
5. Discordアプリを作成し、OAuthを設定
6. 開発サーバーを起動: `npm run dev`

## 環境変数

- `NEXTAUTH_SECRET`: NextAuth.jsのシークレット
- `NEXTAUTH_URL`: アプリのURL
- `DISCORD_CLIENT_ID`: DiscordアプリのクライアントID
- `DISCORD_CLIENT_SECRET`: Discordアプリのクライアントシークレット
- `DISCORD_GUILD_ID`: DiscordサーバーのID
- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトのURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabaseの匿名キー

## Supabase設定

データベーステーブルを作成:

```sql
-- pages table
CREATE TABLE pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  created_by TEXT NOT NULL,
  updated_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- users table (optional, for additional user data)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT,
  roles TEXT[]
);
```

## デプロイ

Vercelにデプロイする場合、環境変数をVercelの設定に追加してください。

## 開発

- `npm run dev`: 開発サーバー起動
- `npm run build`: ビルド
- `npm run start`: プロダクションサーバー起動
