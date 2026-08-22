"use client";

import Link from "next/link";
import { getCard, PILLAR_LABEL } from "@/lib/deck";
import type { Pillar } from "@/lib/types";

const CACHE = "20260822i";

/** 架空の3人チーム見本 */
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

const PILLAR_BAR: Record<Pillar, string> = {
  heart: "bg-[#ff8ec8]",
  work: "bg-[#6ea8ff]",
  growth: "bg-[#7ef0d4]",
};

function ValueCard({
  cardId,
  caption,
  compact = false,
}: {
  cardId: string;
  caption?: string;
  compact?: boolean;
}) {
  const card = getCard(cardId);
  if (!card) return null;
  return (
    <figure
      className={`overflow-hidden rounded-2xl border border-line bg-[#12122a] ${
        compact ? "p-2" : "p-3"
      }`}
    >
      <div
        className={`flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-[#1a2040] to-[#0c1020] ${
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
      <figcaption
        className={`mt-2 text-center font-semibold ${
          compact ? "text-xs" : "text-sm"
        }`}
      >
        {caption ?? card.label}
      </figcaption>
      {!compact && (
        <p className="text-center text-[10px] text-muted">
          {PILLAR_LABEL[card.pillar]}
        </p>
      )}
    </figure>
  );
}

export default function ReportSamplePage() {
  const mains = SAMPLE_MEMBERS.map((m) => m.mainId);
  const pillarCount = { heart: 0, work: 0, growth: 0 } as Record<Pillar, number>;
  for (const m of SAMPLE_MEMBERS) {
    const main = getCard(m.mainId);
    if (main) pillarCount[main.pillar] += 1;
    for (const sid of m.subIds) {
      const s = getCard(sid);
      if (s) pillarCount[s.pillar] += 1;
    }
  }
  const total = Math.max(1, pillarCount.heart + pillarCount.work + pillarCount.growth);

  return (
    <main className="relative z-[1] mx-auto flex w-full max-w-lg flex-1 flex-col gap-10 px-4 py-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold tracking-wide text-mint">見本 · デザイン比較</p>
        <h1 className="text-2xl font-bold">チームレポートの見せ方</h1>
        <p className="text-sm leading-relaxed text-muted">
          同じ架空チーム（3人）で、背景散らし案とカード展示案を並べています。下のBがおすすめ案です。
        </p>
        <Link href="/illustrations/v3" className="text-sm text-mint underline">
          v3ギャラリーを見る
        </Link>
      </header>

      {/* A: 現状寄りの背景散らし */}
      <section className="relative overflow-hidden rounded-2xl border border-line bg-panel p-4">
        <p className="relative z-[1] mb-3 text-xs font-semibold text-accent">
          A. 背景に薄く散らす（いま近い）
        </p>
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {mains.map((id, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={id}
              src={`/illustrations/v3/${id}.svg?v=${CACHE}`}
              alt=""
              className="absolute opacity-[0.16]"
              style={{
                width: 160,
                height: 160,
                top: `${12 + i * 28}%`,
                left: i === 1 ? "55%" : i === 2 ? "8%" : "28%",
                transform: `rotate(${[-12, 10, -8][i]}deg)`,
              }}
            />
          ))}
        </div>
        <div className="relative z-[1] space-y-3 rounded-xl bg-background/70 p-3 backdrop-blur-[2px]">
          <h2 className="text-lg font-bold">チーム1</h2>
          <p className="text-sm text-muted">部屋 DEMO · 3人</p>
          <p className="text-sm leading-relaxed text-[#e8ecff]/90">
            このチームは創造と信頼、自由を軸にする傾向がある…（分析文）
          </p>
          <p className="text-[11px] text-muted">
            ※ 気づかれにくく、画面サイズでバランスが崩れやすい
          </p>
        </div>
      </section>

      {/* B: カード展示（推奨） */}
      <section className="space-y-4 rounded-2xl border border-mint/40 bg-panel p-4 shadow-[0_0_0_1px_rgba(126,240,212,0.15)]">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-mint">B. カードとして見せる（おすすめ案）</p>
          <h2 className="text-lg font-bold">チーム1</h2>
          <p className="text-sm text-muted">部屋 DEMO · 3人</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-accent">このチームのメイン価値観</h3>
          <div className="grid grid-cols-3 gap-2">
            {SAMPLE_MEMBERS.map((m) => (
              <ValueCard
                key={m.mainId}
                cardId={m.mainId}
                caption={`${getCard(m.mainId)?.label ?? ""}\n${m.name}`.replace("\n", " · ")}
              />
            ))}
          </div>
          <p className="text-[11px] text-muted">
            名前＋メインをカード化。誰の軸かが一目でわかる
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-accent">サブ</h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {SAMPLE_MEMBERS.flatMap((m) =>
              m.subIds.map((sid) => (
                <ValueCard
                  key={`${m.name}-${sid}`}
                  cardId={sid}
                  caption={`${getCard(sid)?.label ?? ""} · ${m.name}`}
                  compact
                />
              )),
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-accent">柱の偏り</h3>
          {(["heart", "work", "growth"] as Pillar[]).map((p) => {
            const count = pillarCount[p];
            const pct = Math.round((count / total) * 100);
            return (
              <div key={p} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{PILLAR_LABEL[p]}</span>
                  <span className="text-muted">
                    {count}（{pct}%）
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-background">
                  <div
                    className={`h-full rounded-full ${PILLAR_BAR[p]}`}
                    style={{ width: `${Math.max(4, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-1 rounded-xl border border-line bg-background/80 p-3">
          <h3 className="text-sm font-semibold text-accent">チーム分析</h3>
          <p className="text-sm leading-relaxed text-[#e8ecff]/90">
            このチームは自由・創造・信頼を軸にする人が集まり、挑戦しながら関係性を大切にする傾向がある。安定より学びとつながりを優先する空気が強い。
          </p>
        </div>
      </section>

      <p className="text-sm text-muted">
        気に入った方（A / B / 別案）を教えてください。そこから本番のレポートに反映します。
      </p>

      <Link href="/" className="text-sm text-mint underline">
        トップへ
      </Link>
    </main>
  );
}
