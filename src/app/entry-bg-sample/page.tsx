"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { LineArtCoverBg } from "@/components/LineArtCoverBg";
import { LineArtScatter } from "@/components/LineArtScatter";

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
  recommended,
  wide,
  children,
}: {
  label: string;
  note: string;
  recommended?: boolean;
  /** 横長プレビューで崩れやすさを見せる */
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div>
        <p
          className={`text-xs font-semibold ${
            recommended ? "text-mint" : "text-accent"
          }`}
        >
          {label}
          {recommended ? " · おすすめ／試用中" : ""}
        </p>
        <p className="text-[11px] leading-relaxed text-muted">{note}</p>
      </div>
      <div
        className={`relative overflow-hidden rounded-2xl border border-line bg-[#0b1020] ${
          wide ? "aspect-[16/9]" : "aspect-[9/16] max-h-[520px]"
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
          見本 · 入場系の背景
        </p>
        <h1 className="text-2xl font-bold">トップ／ロビー背景</h1>
        <p className="text-sm leading-relaxed text-muted">
          同じUI仮置きで、静か／従来の％散らし／cover壁紙を比較します。coverは本番のトップ・ロビーにも入れて試せます。
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/" className="text-mint underline">
            トップで試す
          </Link>
          <Link href="/report-sample" className="text-mint underline">
            レポート背景見本
          </Link>
        </div>
      </header>

      <Frame
        label="1. 静か"
        note="線画なし。アプリ共通のトーンだけ。"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(160deg, #0b1020, #161a38 55%, #1a1230)",
          }}
        />
      </Frame>

      <Frame
        label="2. 従来の％散らし"
        note="左右％でバラバラ配置。下の横長枠だと余白のでき方が変わりやすい。"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <LineArtScatter mode="preview" />
        </div>
      </Frame>

      <Frame
        label="2b. 従来 · 横長で見る"
        note="同じ％散らしを横長枠に入れた例（崩れやすさの確認用）。"
        wide
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <LineArtScatter mode="preview" />
        </div>
      </Frame>

      <Frame
        label="3. cover壁紙（9:16構図）"
        note="決まった構図を等倍で広げ、はみ出しだけ切る。縦枠でも横枠でも相対関係は同じ。"
        recommended
      >
        <LineArtCoverBg mode="preview" />
      </Frame>

      <Frame
        label="3b. cover · 横長で見る"
        note="同じ構図を横長にcover。端が切れるが配置バランスは維持。"
        wide
      >
        <LineArtCoverBg mode="preview" denser />
      </Frame>

      <p className="text-sm text-muted">
        本番トップ／ロビーはいま <span className="text-mint">3（cover）</span>{" "}
        を入れています。見比べた感想をください（1 / 2 / 3）。
      </p>

      <Link href="/" className="text-sm text-mint underline">
        トップへ
      </Link>
    </main>
  );
}
