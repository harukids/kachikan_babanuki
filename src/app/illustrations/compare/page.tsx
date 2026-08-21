"use client";

import Link from "next/link";
import { DECK, PILLAR_LABEL } from "@/lib/deck";

const VERSIONS = [
  { key: "v1", label: "v1 シンボル", src: (id: string) => `/illustrations/${id}.svg?v=20260822c` },
  { key: "v2", label: "v2 一筆", src: (id: string) => `/illustrations/v2/${id}.svg?v=20260822c` },
  { key: "v3", label: "v3 装飾", src: (id: string) => `/illustrations/v3/${id}.svg?v=20260822c` },
] as const;

export default function IllustrationsComparePage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <header className="mb-8 space-y-2">
        <p className="text-xs font-semibold tracking-wide text-mint">プレビュー</p>
        <h1 className="text-2xl font-bold">v1 / v2 / v3 の見比べ</h1>
        <p className="text-sm text-muted">
          左からシンボル・一筆書き風・シンボル＋装飾です。
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/illustrations" className="text-mint underline">
            v1
          </Link>
          <Link href="/illustrations/v2" className="text-mint underline">
            v2
          </Link>
          <Link href="/illustrations/v3" className="text-mint underline">
            v3
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
            <div className="grid grid-cols-3 gap-2">
              {VERSIONS.map((v) => (
                <div key={v.key} className="rounded-xl bg-[#12122a] p-2">
                  <p className="mb-1 text-center text-[10px] text-muted">{v.label}</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={v.src(card.id)}
                    alt={`${card.label} ${v.key}`}
                    className="mx-auto aspect-square w-full max-w-[140px] object-contain"
                  />
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
