"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { getCard } from "@/lib/deck";
import { getValueCardPillarTone } from "@/lib/result-poster";

const CACHE = "20260822i";

const SAMPLE_MEMBERS = [
  {
    name: "はるき",
    mainId: "heart-02",
    subIds: ["heart-09", "growth-06"],
  },
  {
    name: "ちょむ",
    mainId: "work-13",
    subIds: ["work-08", "growth-10"],
  },
  {
    name: "みお",
    mainId: "growth-08",
    subIds: ["heart-17", "growth-04"],
  },
] as const;

const MAIN_IDS = SAMPLE_MEMBERS.map((m) => m.mainId);

function ValueCard({
  cardId,
  owner,
  compact = false,
}: {
  cardId: string;
  owner?: string;
  compact?: boolean;
}) {
  const card = getCard(cardId);
  if (!card) return null;
  const tone = getValueCardPillarTone(card.pillar);
  return (
    <figure
      className={`overflow-hidden rounded-2xl border ${tone.figure} ${
        compact ? "p-2" : "p-3"
      }`}
    >
      <div
        className={`flex aspect-square items-center justify-center rounded-xl ${tone.art} ${
          compact ? "p-2" : "p-4"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/illustrations/v3/${card.id}.svg?v=${CACHE}`}
          alt={card.label}
          className="h-full w-full object-contain opacity-95"
        />
      </div>
      <figcaption className="mt-2 space-y-0.5 text-center">
        <p
          className={`font-semibold leading-snug ${
            compact ? "text-[11px]" : "text-sm"
          }`}
        >
          {card.label}
        </p>
        {owner && (
          <p className={`text-muted ${compact ? "text-[9px]" : "text-[11px]"}`}>
            {owner}
          </p>
        )}
      </figcaption>
    </figure>
  );
}

function ReportContent() {
  return (
    <div className="relative z-[1] space-y-4">
      <div>
        <p className="text-xs font-semibold tracking-wide text-mint">
          Value Drop · チームレポート
        </p>
        <h2 className="text-lg font-bold">チーム1</h2>
        <p className="text-sm text-muted">部屋 DEMO · 3人</p>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-accent">メイン</h3>
        <div className="grid grid-cols-3 gap-2">
          {SAMPLE_MEMBERS.map((m) => (
            <ValueCard key={m.mainId} cardId={m.mainId} owner={m.name} />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-accent">サブ</h3>
        <div className="grid grid-cols-3 gap-2">
          {SAMPLE_MEMBERS.flatMap((m) =>
            m.subIds.map((sid) => (
              <ValueCard
                key={`${m.name}-${sid}`}
                cardId={sid}
                owner={m.name}
                compact
              />
            )),
          )}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-panel/80 p-3">
        <h3 className="text-sm font-semibold text-accent">チーム分析</h3>
        <p className="mt-1 text-sm leading-relaxed text-[#e8ecff]/90">
          自由・創造・信頼を軸にする人が集まり、挑戦しながら関係性を大切にする傾向がある。
        </p>
      </div>
    </div>
  );
}

function SampleFrame({
  label,
  note,
  recommended,
  children,
}: {
  label: string;
  note: string;
  recommended?: boolean;
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
          {recommended ? " · おすすめ" : ""}
        </p>
        <p className="text-[11px] text-muted">{note}</p>
      </div>
      <div className="relative min-h-[420px] overflow-hidden rounded-2xl border border-line">
        {children}
      </div>
    </section>
  );
}

export default function ReportSamplePage() {
  return (
    <main className="relative z-[1] mx-auto flex w-full max-w-lg flex-1 flex-col gap-10 px-4 py-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold tracking-wide text-mint">
          見本 · 背景の比較
        </p>
        <h1 className="text-2xl font-bold">チームレポートの背景</h1>
        <p className="text-sm leading-relaxed text-muted">
          カードUIは確定案（下2段・柱色）のまま、背景だけ3案を並べています。
        </p>
      </header>

      <SampleFrame
        label="1. 静か（装飾なし）"
        note="アプリ共通の暗いトーンだけ。カードが主役。"
        recommended
      >
        <div className="relative bg-[#0b1020] p-4">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 70% 50% at 10% 0%, rgba(110,168,255,0.22), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 10%, rgba(183,148,255,0.18), transparent 50%), linear-gradient(160deg, #0b1020, #161a38 55%, #1a1230)",
            }}
          />
          <ReportContent />
        </div>
      </SampleFrame>

      <SampleFrame
        label="2. 柱色の薄いウォッシュ"
        note="チームに出た柱色を、画面奥にごく薄く滲ませる。"
      >
        <div className="relative bg-[#0b1020] p-4">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 55% 45% at 18% 22%, rgba(255,142,200,0.28), transparent 60%), radial-gradient(ellipse 50% 40% at 82% 28%, rgba(110,168,255,0.26), transparent 58%), radial-gradient(ellipse 55% 45% at 50% 88%, rgba(126,240,212,0.22), transparent 60%), linear-gradient(160deg, #0b1020, #12183a)",
            }}
          />
          <ReportContent />
        </div>
      </SampleFrame>

      <SampleFrame
        label="3. 線画を薄く散らす"
        note="メインの線画を背面に低透明度で置く（以前のA案寄り）。"
      >
        <div className="relative bg-[#0b1020] p-4">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            {MAIN_IDS.map((id, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={id}
                src={`/illustrations/v3/${id}.svg?v=${CACHE}`}
                alt=""
                className="absolute opacity-[0.12]"
                style={{
                  width: 168,
                  height: 168,
                  top: `${8 + i * 30}%`,
                  left: i === 1 ? "58%" : i === 2 ? "6%" : "30%",
                  transform: `rotate(${[-14, 12, -6][i]}deg)`,
                }}
              />
            ))}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(160deg, rgba(11,16,32,0.55), rgba(22,26,56,0.35))",
              }}
            />
          </div>
          <ReportContent />
        </div>
      </SampleFrame>

      <p className="text-sm text-muted">
        どれがよさそうか教えてください（1 / 2 / 3）。おすすめは 1 です。
      </p>

      <Link href="/" className="text-sm text-mint underline">
        トップへ
      </Link>
    </main>
  );
}
