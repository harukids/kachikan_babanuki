# 価値観ババ抜き（リモート）

AI-Driven School 卒業制作。仕事仲間と価値観を言語化するカードワークの Web アプリ。

## セットアップ

1. [Supabase](https://supabase.com) でプロジェクト作成
2. `supabase/schema.sql` を SQL Editor で実行
3. 環境変数をコピーして値を入れる

```bash
cp .env.local.example .env.local
```

4. 開発サーバー

```bash
npm install
npm run dev
```

5. http://localhost:3000 を開く

## ドキュメント

- 状態マシン: `../卒業制作_状態マシン仕様.md`
- 企画スライド: Surge 上の企画概要

## いま動くもの

- ホーム: 部屋作成 / コードで入室（シェル）
- 型・60枚デッキ・localStorage 復帰キー
- Supabase スキーマ

## 次に作るもの

1. LOBBY の実同期（入室・席順並べ替え・開始）
2. DEALING → 1ターン（STEAL → CONFIRM → DISCARD → GAIN）
3. 5ラウンド → 選定 → 理由 → 結果
