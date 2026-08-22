"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getCard, PILLAR_LABEL } from "@/lib/deck";
import { MAX_TEAM_GROUPS } from "@/lib/team-report";

/** 見本用の架空参加者（認証なしでUI確認） */
const SAMPLE_PLAYERS = [
  {
    id: "p1",
    display_name: "はるき",
    main_card_id: "heart-02",
    seat_index: 0,
  },
  {
    id: "p2",
    display_name: "ちょむ",
    main_card_id: "work-13",
    seat_index: 1,
  },
  {
    id: "p3",
    display_name: "みお",
    main_card_id: "growth-08",
    seat_index: 2,
  },
  {
    id: "p4",
    display_name: "がのしゅ",
    main_card_id: "heart-01",
    seat_index: 3,
  },
  {
    id: "p5",
    display_name: "怠惰を極めし者",
    main_card_id: "work-09",
    seat_index: 4,
  },
  {
    id: "p6",
    display_name: "そら",
    main_card_id: "growth-10",
    seat_index: 5,
  },
] as const;

const SAMPLE_REPORTS = [
  {
    id: "demo-1",
    groupLabel: "チーム1",
    memberCount: 3,
    sharePath: "/report/demo-team-1",
  },
  {
    id: "demo-2",
    groupLabel: "チーム2",
    memberCount: 3,
    sharePath: "/report/demo-team-2",
  },
];

export default function AdminTeamAssignSamplePage() {
  const [assignments, setAssignments] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    SAMPLE_PLAYERS.forEach((p, i) => {
      init[p.id] = i < 3 ? 1 : 2;
    });
    return init;
  });
  const [showResult, setShowResult] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const teamCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const n of Object.values(assignments)) {
      if (n > 0) counts[n] = (counts[n] ?? 0) + 1;
    }
    return counts;
  }, [assignments]);

  return (
    <main className="relative z-[1] mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-8 sm:gap-6 sm:py-10">
      <header className="space-y-1.5">
        <p className="text-xs font-semibold tracking-wide text-mint">
          見本 · ホスト用
        </p>
        <h1 className="text-xl font-bold sm:text-2xl">チーム分け画面</h1>
        <p className="text-sm leading-relaxed text-muted">
          本番の管理画面（合言葉のあと）と同じレイアウトです。架空の6人で操作できます。生成ボタンは見た目だけのデモです。
        </p>
        <Link href="/admin/reports" className="text-sm text-mint underline">
          本番の管理画面へ
        </Link>
      </header>

      <section className="space-y-3 rounded-2xl border border-line bg-panel p-4">
        <label className="block space-y-1.5">
          <span className="text-sm text-muted">部屋コード</span>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              className="w-full flex-1 rounded-xl border border-line bg-background px-3 py-2.5 tracking-[0.15em] sm:py-2"
              value="NNS3X"
              readOnly
            />
            <button
              type="button"
              className="w-full shrink-0 rounded-xl border border-line px-4 py-2.5 text-sm sm:w-auto sm:py-2"
            >
              読み込む
            </button>
          </div>
        </label>
        <p className="text-xs text-muted">部屋 NNS3X · フェーズ RESULT · 6人</p>
      </section>

      <section className="space-y-3 rounded-2xl border border-line bg-panel p-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-sm font-semibold text-accent">チームの振り分け</h2>
          <p className="text-[11px] text-muted">
            {Array.from({ length: MAX_TEAM_GROUPS }, (_, i) => i + 1)
              .filter((n) => teamCounts[n])
              .map((n) => `チーム${n}: ${teamCounts[n]}人`)
              .join(" · ") || "未割当"}
          </p>
        </div>
        <ul className="space-y-2">
          {SAMPLE_PLAYERS.map((p) => {
            const main = getCard(p.main_card_id);
            return (
              <li
                key={p.id}
                className="flex flex-col gap-2 rounded-xl bg-background px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:py-2"
              >
                <div className="min-w-0">
                  <p className="font-semibold">{p.display_name}</p>
                  <p className="text-xs text-muted">
                    メイン: {main?.label ?? "—"}
                    {main ? `（${PILLAR_LABEL[main.pillar]}）` : ""}
                  </p>
                </div>
                <select
                  className="w-full rounded-lg border border-line bg-panel px-3 py-2.5 text-sm sm:w-auto sm:min-w-[8.5rem] sm:py-1.5"
                  value={assignments[p.id] ?? 0}
                  onChange={(e) =>
                    setAssignments((prev) => ({
                      ...prev,
                      [p.id]: Number(e.target.value),
                    }))
                  }
                >
                  <option value={0}>含めない</option>
                  {Array.from({ length: MAX_TEAM_GROUPS }, (_, i) => i + 1).map(
                    (n) => (
                      <option key={n} value={n}>
                        チーム{n}
                      </option>
                    ),
                  )}
                </select>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          className="w-full rounded-xl bg-gradient-to-r from-[#6ea8ff] via-[#ff8ec8] to-[#ffb086] px-4 py-3.5 text-sm font-bold text-[#12122a]"
          onClick={() => setShowResult(true)}
        >
          レポートを生成する（見本）
        </button>
      </section>

      {showResult && (
        <section className="space-y-3 rounded-2xl border border-line bg-panel p-4">
          <h2 className="text-sm font-semibold text-mint">できた共有リンク</h2>
          <p className="text-[11px] text-muted">
            ※ 見本なのでリンク先はダミーです。本番ではここで本物のURLが出ます。
          </p>
          <ul className="space-y-3">
            {SAMPLE_REPORTS.map((r) => (
              <li
                key={r.id}
                className="space-y-2.5 rounded-xl bg-background px-3 py-3"
              >
                <p className="font-semibold">
                  {r.groupLabel}（{r.memberCount}人）
                </p>
                <p className="break-all text-[11px] leading-relaxed text-muted sm:text-xs">
                  https://value-drop.vercel.app{r.sharePath}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <button
                    type="button"
                    className="rounded-lg border border-line px-3 py-2.5 text-xs sm:py-1.5"
                    onClick={() => {
                      setCopiedId(r.id);
                      window.setTimeout(() => setCopiedId(null), 2000);
                    }}
                  >
                    {copiedId === r.id ? "コピーしました" : "URLをコピー"}
                  </button>
                  <span className="rounded-lg border border-line px-3 py-2.5 text-center text-xs text-muted sm:py-1.5">
                    開く（見本）
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link href="/" className="text-sm text-mint underline">
        トップへ
      </Link>
    </main>
  );
}
