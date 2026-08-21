# ポスター用線画イラスト（A案）

実行時に AI は呼びません。事前に作った静的ファイルを読みます。

## 読み込み順

1. `/illustrations/{cardId}.svg` または `.png`（例: `heart-02.svg`）
2. なければ `/illustrations/pillar-{heart|work|growth}.svg`

## 追加のしかた

1. 白線・透過背景の線画を AI などで生成
2. ファイル名をカード ID にする（`src/lib/deck.ts` の `id`）
3. このフォルダに置くだけ

柱フォールバック（3枚）は最初から入っています。
