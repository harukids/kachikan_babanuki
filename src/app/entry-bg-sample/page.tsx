"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { LineArtCoverBg } from "@/components/LineArtCoverBg";
import {
  WALLPAPER_PATTERNS,
  type WallpaperPatternId,
} from "@/lib/line-art-wallpapers";

const PATTERN_ORDER: WallpaperPatternId[] = [
  "scatter",
  "scatterDense",
  "monogram",
  "monogramDense",
];

function FakeEntryUi() {
  return (
    <div className="relative z-[1] space-y-3 p-4">
      <p className="text-xs font-semibold tracking-wide text-mint">
        Value Drop online
      </p>
      <h2 className="text-xl font-bold leading-tight">
        価値観を選び、
        <br />
        言葉にする
      </h2>
      <div className="rounded-2xl border border-line bg-panel/90 p-4 backdrop-blur-[2px]">
        <p className="text-sm text-muted">表示名 · 部屋を作る …（UIの仮置き）</p>
      </div>
    </div>
  );
}

function Frame({
  label,
  note,
  wide,
  children,
}: {
  label: string;
  note: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div>
        <p className="text-xs font-semibold text-mint">{label}</p>
        <p className="text-[11px] leading-relaxed text-muted">{note}</p>
      </div>
      <div
        className={`relative overflow-hidden rounded-2xl border border-line bg-[#0b1020] ${
          wide ? "aspect-[16/9]" : "aspect-[9/16] max-h-[560px]"
        }`}
      >
        {children}
        <FakeEntryUi />
      </div>
    </section>
  );
}

export default function EntryBgSamplePage() {
  return (
    <main className="relative z-[1] mx-auto flex w-full max-w-lg flex-1 flex-col gap-10 px-4 py-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold tracking-wide text-mint">
          見本 · cover壁紙のパターン
        </p>
        <h1 className="text-2xl font-bold">シンボル壁紙の構図</h1>
        <p className="text-sm leading-relaxed text-muted">
          いずれも 9:16 構図の cover 方式です。本番トップ／ロビーはいま
          <span className="text-mint"> 散らし・高密度 </span>
          を試用中なので、スマホとPCで同じURLを見比べてください。
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/" className="text-mint underline">
            トップで実機確認
          </Link>
          <Link href="/entry-bg-sample" className="text-mint underline">
            この見本を再読込
          </Link>
        </div>
      </header>

      {PATTERN_ORDER.map((id) => {
        const p = WALLPAPER_PATTERNS[id];
        return (
          <div key={id} className="space-y-4">
            <Frame label={p.label} note={p.note}>
              <LineArtCoverBg mode="preview" pattern={id} />
            </Frame>
            <Frame
              label={`${p.label} · 横長`}
              note="同じ構図を横にcoverしたとき。"
              wide
            >
              <LineArtCoverBg mode="preview" pattern={id} denser />
            </Frame>
          </div>
        );
      })}

      <p className="text-sm text-muted">
        気に入ったパターン名を教えてください（散らし／散らし高密度／モノグラム／モノグラム高密度）。
      </p>

      <Link href="/" className="text-sm text-mint underline">
        トップへ
      </Link>
    </main>
  );
}
