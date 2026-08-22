"use client";

import Link from "next/link";
import { getCard } from "@/lib/deck";
import { getValueCardPillarTone } from "@/lib/result-poster";

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

type Layout = "below" | "above";

function ValueCard({
  cardId,
  owner,
  compact = false,
  layout,
}: {
  cardId: string;
  owner?: string;
  compact?: boolean;
  layout: Layout;
}) {
  const card = getCard(cardId);
  if (!card) return null;
  const tone = getValueCardPillarTone(card.pillar);
  const title = (
    <p
      className={`font-semibold leading-snug ${
        compact ? "text-[11px]" : "text-sm"
      }`}
    >
      {card.label}
    </p>
  );
  const ownerLine = owner ? (
    <p className={`text-muted ${compact ? "text-[9px]" : "text-[11px]"}`}>
      {owner}
    </p>
  ) : null;

  return (
    <figure
      className={`overflow-hidden rounded-2xl border ${tone.figure} ${
        compact ? "p-2" : "p-3"
      }`}
    >
      {layout === "above" && (
        <div className={`mb-2 text-center ${compact ? "space-y-0" : "space-y-0.5"}`}>
          {title}
        </div>
      )}
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
      <figcaption
        className={`mt-2 text-center ${
          layout === "below" ? "space-y-0.5" : ""
        }`}
      >
        {layout === "below" ? (
          <>
            {title}
            {ownerLine}
          </>
        ) : (
          ownerLine
        )}
      </figcaption>
    </figure>
  );
}

function CardBlock({ layout }: { layout: Layout }) {
  return (
    <>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-accent">メイン</h3>
        <div className="grid grid-cols-3 gap-2">
          {SAMPLE_MEMBERS.map((m) => (
            <ValueCard
              key={m.mainId}
              cardId={m.mainId}
              owner={m.name}
              layout={layout}
            />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-accent">サブ</h3>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {SAMPLE_MEMBERS.flatMap((m) =>
            m.subIds.map((sid) => (
              <ValueCard
                key={`${layout}-${m.name}-${sid}`}
                cardId={sid}
                owner={m.name}
                compact
                layout={layout}
              />
            )),
          )}
        </div>
      </div>
    </>
  );
}

export default function ReportSamplePage() {
  return (
    <main className="relative z-[1] mx-auto flex w-full max-w-lg flex-1 flex-col gap-8 px-4 py-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold tracking-wide text-mint">
          見本 · キャプション位置の比較
        </p>
        <h1 className="text-2xl font-bold">意味と持ち主の置き方</h1>
        <p className="text-sm leading-relaxed text-muted">
          同じ3人チームで、下2段案と「上に意味／下に持ち主」案を並べています。
        </p>
      </header>

      <section className="space-y-4 rounded-2xl border border-mint/40 bg-panel p-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-mint">1. 下に2段（いまの案）</p>
          <p className="text-[11px] text-muted">
            絵 → 価値観名 → 持ち主。タロットの「絵が中央・名札は下」に近い。
          </p>
        </div>
        <CardBlock layout="below" />
      </section>

      <section className="space-y-4 rounded-2xl border border-line bg-panel p-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-accent">2. 上に意味／下に持ち主</p>
          <p className="text-[11px] text-muted">
            価値観名 → 絵 → 持ち主。カード名が先に目に入る。
          </p>
        </div>
        <CardBlock layout="above" />
      </section>

      <p className="text-sm text-muted">
        どちらが読みやすいか教えてください（1 / 2）。
      </p>

      <Link href="/" className="text-sm text-mint underline">
        トップへ
      </Link>
    </main>
  );
}
