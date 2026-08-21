"use client";

import Link from "next/link";
import { DECK, PILLAR_LABEL } from "@/lib/deck";
import type { Pillar } from "@/lib/types";

const PILLARS: Pillar[] = ["heart", "work", "growth"];

export default function IllustrationsV3Page() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <header className="mb-8 space-y-2">
        <p className="text-xs font-semibold tracking-wide text-mint">プレビュー · v3</p>
        <h1 className="text-2xl font-bold">シンボル＋デザイン装飾</h1>
        <p className="text-sm text-muted">
          採用セットです（ポスターもこちら）。「継続」だけ v2 の一筆循環に差し替えています。
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/illustrations" className="text-mint underline">
            v1
          </Link>
          <Link href="/illustrations/v2" className="text-mint underline">
            v2
          </Link>
          <Link href="/illustrations/compare" className="text-mint underline">
            見比べ（v1/v2/v3）
          </Link>
        </div>
      </header>

      {PILLARS.map((pillar) => (
        <section key={pillar} className="mb-10">
          <h2 className="mb-4 text-sm font-semibold text-accent">
            {PILLAR_LABEL[pillar]}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {DECK.filter((c) => c.pillar === pillar).map((card) => (
              <figure
                key={card.id}
                className="overflow-hidden rounded-2xl border border-line bg-[#12122a] p-3"
              >
                <div className="flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-[#1a2040] to-[#0c1020] p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/illustrations/v3/${card.id}.svg`}
                    alt={card.label}
                    className="h-full w-full object-contain opacity-95"
                  />
                </div>
                <figcaption className="mt-2 text-center text-sm font-semibold">
                  {card.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
