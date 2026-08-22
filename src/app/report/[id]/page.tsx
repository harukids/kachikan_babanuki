"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DECK, getCard, PILLAR_LABEL } from "@/lib/deck";
import { downloadTeamReportImage } from "@/lib/team-report-image";
import {
  resolveSubCardsWithOwners,
  type TeamMemberSnapshot,
  type TeamSnapshot,
} from "@/lib/team-report";
import { getValueCardPillarTone } from "@/lib/result-poster";
import type { Pillar } from "@/lib/types";

type ReportPayload = {
  id: string;
  roomCode: string;
  groupLabel: string;
  snapshot: TeamSnapshot;
  analysis: string;
  createdAt: string;
};

const CACHE = "20260822i";

const PILLAR_BAR: Record<Pillar, string> = {
  heart: "bg-[#ff8ec8]",
  work: "bg-[#6ea8ff]",
  growth: "bg-[#7ef0d4]",
};

function findIdByLabel(label: string | null | undefined): string | null {
  if (!label) return null;
  return DECK.find((c) => c.label === label)?.id ?? null;
}

function memberMainId(m: TeamMemberSnapshot): string | null {
  return m.mainCardId || findIdByLabel(m.mainLabel);
}

function ValueCardTile({
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
          compact ? "p-2" : "p-3"
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

export default function TeamReportPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [report, setReport] = useState<ReportPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const res = await fetch(`/api/reports/${id}`);
        const data = (await res.json()) as ReportPayload & { error?: string };
        if (!res.ok) throw new Error(data.error || "読み込みに失敗しました");
        if (!cancelled) {
          setReport(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setReport(null);
          setError(e instanceof Error ? e.message : "読み込みに失敗しました");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const pillarTotal = useMemo(() => {
    if (!report) return 1;
    const s = report.snapshot.pillarAll;
    return Math.max(1, s.heart + s.work + s.growth);
  }, [report]);

  const subs = useMemo(
    () => (report ? resolveSubCardsWithOwners(report.snapshot) : []),
    [report],
  );

  if (loading) {
    return (
      <main className="relative z-[1] mx-auto flex max-w-lg flex-1 items-center justify-center p-8 text-muted">
        読み込み中…
      </main>
    );
  }

  if (!report) {
    return (
      <main className="relative z-[1] mx-auto max-w-lg space-y-4 p-8">
        <p className="text-[#f0a0a0]">{error ?? "レポートがありません"}</p>
        <Link href="/" className="text-mint underline">
          トップへ
        </Link>
      </main>
    );
  }

  const pillars: Pillar[] = ["heart", "work", "growth"];
  const n = report.snapshot.members.length;
  const mainCols =
    n <= 2 ? "grid-cols-2" : n === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4";

  return (
    <main className="relative z-[1] mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 px-4 py-8 sm:gap-6 sm:py-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold tracking-wide text-mint">
          Value Drop · チームレポート
        </p>
        <h1 className="text-2xl font-bold sm:text-3xl">{report.groupLabel}</h1>
        <p className="text-sm text-muted">
          部屋 {report.roomCode} · {report.snapshot.memberCount}人
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-accent">
          このチームのメイン価値観
        </h2>
        <div className={`grid gap-2 ${mainCols}`}>
          {report.snapshot.members.map((m) => {
            const mainId = memberMainId(m);
            if (!mainId) return null;
            return (
              <ValueCardTile
                key={m.id}
                cardId={mainId}
                owner={m.displayName}
              />
            );
          })}
        </div>
      </section>

      {subs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-accent">サブ</h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {subs.map((s) => (
              <ValueCardTile
                key={s.cardId}
                cardId={s.cardId}
                owner={s.owners.join("、")}
                compact
              />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3 rounded-2xl border border-line bg-panel p-4">
        <h2 className="text-sm font-semibold text-accent">
          柱の偏り（メイン＋サブ）
        </h2>
        <ul className="space-y-3">
          {pillars.map((p) => {
            const count = report.snapshot.pillarAll[p] ?? 0;
            const pct = Math.round((count / pillarTotal) * 100);
            return (
              <li key={p} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{PILLAR_LABEL[p]}</span>
                  <span className="text-muted">
                    {count}（{pct}%）
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-background">
                  <div
                    className={`h-full rounded-full ${PILLAR_BAR[p]}`}
                    style={{ width: `${Math.max(4, pct)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-2 rounded-2xl border border-line bg-panel p-4">
        <h2 className="text-sm font-semibold text-accent">チーム分析</h2>
        <p className="text-sm leading-relaxed text-[#e8ecff]/90">
          {report.analysis || "（分析なし）"}
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-xl border border-line px-4 py-2 text-sm"
          onClick={() =>
            void (async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
              } catch {
                setError("コピーに失敗しました");
              }
            })()
          }
        >
          {copied ? "コピーしました" : "URLをコピー"}
        </button>
        <button
          type="button"
          disabled={saving}
          className="rounded-xl bg-gradient-to-r from-[#6ea8ff] via-[#ff8ec8] to-[#ffb086] px-4 py-2 text-sm font-bold text-[#12122a] disabled:opacity-50"
          onClick={() =>
            void (async () => {
              setSaving(true);
              setError(null);
              try {
                await downloadTeamReportImage({
                  groupLabel: report.groupLabel,
                  roomCode: report.roomCode,
                  snapshot: report.snapshot,
                  analysis: report.analysis,
                  createdAt: report.createdAt,
                });
              } catch (e) {
                setError(
                  e instanceof Error ? e.message : "画像保存に失敗しました",
                );
              } finally {
                setSaving(false);
              }
            })()
          }
        >
          {saving ? "作成中…" : "画像で保存"}
        </button>
      </div>

      {error && <p className="text-sm text-[#f0a0a0]">{error}</p>}

      <Link href="/" className="text-sm text-mint underline">
        トップへ
      </Link>
    </main>
  );
}
