"use client";

import Link from "next/link";
import { DECK, PILLAR_LABEL } from "@/lib/deck";

export default function IllustrationsComparePage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <header className="mb-8 space-y-2">
        <p className="text-xs font-semibold tracking-wide text-mint">プレビュー</p>
        <h1 className="text-2xl font-bold">v1 と v2 の見比べ</h1>
        <p className="text-sm text-muted">左がシンボル型（v1）、右が一筆書き風（v2）です。</p>
        <div className="flex gap-3 text-sm">
          <Link href="/illustrations" className="text-mint underline">
            v1一覧
          </Link>
          <Link href="/illustrations/v2" className="text-mint underline">
            v2一覧
          </Link>
        </div>
      </header>

      <div className="space-y-4">
        {DECK.map((card) => (
          <article
            key={card.id}
            className="rounded-2xl border border-line bg-panel p-3"
          >
            <p className="mb-2 text-sm font-semibold">
              {card.label}
              <span className="ml-2 text-xs font-normal text-muted">
                {PILLAR_LABEL[card.pillar]}
              </span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#12122a] p-3">
                <p className="mb-1 text-center text-[10px] text-muted">v1</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/illustrations/${card.id}.svg`}
                  alt={`${card.label} v1`}
                  className="mx-auto aspect-square w-full max-w-[160px] object-contain"
                />
              </div>
              <div className="rounded-xl bg-[#12122a] p-3">
                <p className="mb-1 text-center text-[10px] text-muted">v2</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/illustrations/v2/${card.id}.svg`}
                  alt={`${card.label} v2`}
                  className="mx-auto aspect-square w-full max-w-[160px] object-contain"
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
