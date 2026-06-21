# codebox

AIで作ったものを気軽に貼って自慢するコミュニティMVP。

## できること

- タイトル、スクショ、一言説明、コードで匿名投稿
- コードは任意。スクショだけでも投稿可能
- 作品フォルダをZIPにして投稿可能
- 投稿詳細から作品ZIPをダウンロード可能
- 投稿時の削除用パスワードで投稿削除
- 任意で説明文とサムネイル画像を最大4枚
- 画像がない投稿は一覧と詳細に簡易プレビューを自動表示
- Pythonなどは起動画面スクショの投稿を推奨
- 作ったAIを選んで投稿
- Xアカウントを任意で表示
- AIツール別タブで絞り込み
- 画像は選択またはドラッグ＆ドロップで追加
- 新着、人気、急上昇
- タイトルとコードの検索
- コードがある投稿は全文コピー
- いいね
- コメント
- 一覧ではコードを出さず、詳細ページでコードを表示

## 起動

```bash
npm install
npm run dev
```

## 確認

```bash
npm run build
npm audit --audit-level=moderate
```

## Supabase

1. Supabaseで新規プロジェクトを作る。
2. `supabase/schema.sql` をSQL Editorで実行する。
3. `.env.example` を `.env.local` にコピーして値を入れる。

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

環境変数が空の場合は、ブラウザのlocalStorageでデモ動作する。

## デプロイ

Vercelに接続して、上記2つの環境変数を設定する。
